import OpenAI from "openai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "./promptBuilder";

// ============================================================================
// AI Client — wraps OpenAI SDK with retry, validation, and cost control.
// This is the ONLY file that talks to the LLM.
// ============================================================================

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. AI coaching features are disabled."
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

interface AiCallOptions {
  /** The task-specific user prompt */
  userPrompt: string;
  /** Zod schema to validate the response */
  schema: z.ZodSchema;
  /** Max retries on parse/validation failure */
  maxRetries?: number;
  /** Model to use */
  model?: string;
  /** Max tokens for the response */
  maxTokens?: number;
  /** Temperature (0 = deterministic, 1 = creative) */
  temperature?: number;
}

/**
 * Call the LLM, parse JSON output, validate against Zod schema.
 * Retries up to `maxRetries` times on parse/validation failure.
 * Returns the validated, typed object.
 */
export async function callAi<T>(options: AiCallOptions): Promise<T> {
  const {
    userPrompt,
    schema,
    maxRetries = 2,
    model = "gpt-4o-mini",
    maxTokens = 1024,
    temperature = 0.7,
  } = options;

  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error("Empty response from AI model");
      }

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`AI returned invalid JSON: ${raw.substring(0, 200)}`);
      }

      // Validate with Zod
      const validated = schema.parse(parsed);
      return validated as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on auth/billing errors
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("429") ||
        lastError.message.includes("billing")
      ) {
        break;
      }

      // Log retry attempt
      if (attempt < maxRetries) {
        console.warn(
          `[aiClient] Attempt ${attempt + 1} failed, retrying: ${lastError.message}`
        );
      }
    }
  }

  throw new Error(
    `AI call failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}
