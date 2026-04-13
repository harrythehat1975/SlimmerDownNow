import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  buildCoachContext,
  buildChatPrompt,
  callAi,
  aiChatResponseSchema,
} from "@/lib/services/aiCoach";
import type { AiChatResponse } from "@/lib/services/aiCoach";
import { z } from "zod";

// ============================================================================
// POST /api/ai/chat
//
// Conversational coaching endpoint.
// Accepts a user message, returns a contextual reply.
// ============================================================================

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Build context
    const context = await buildCoachContext(userId);

    // 4. Build prompt with user message
    const prompt = buildChatPrompt(context, parsed.data.message);

    // 5. Call AI
    const response = await callAi<AiChatResponse>({
      userPrompt: prompt,
      schema: aiChatResponseSchema,
      userState: context.userState,
      maxRetries: 1,
      temperature: 0.8,
      maxTokens: 512,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ai-chat] Error:", error);
    return NextResponse.json(
      {
        reply:
          "I'm having trouble connecting right now. Please try again in a moment, or check your daily plan for guidance.",
        suggested_actions: [],
        warnings: [],
      },
      { status: 200 } // Return 200 with fallback so UI doesn't break
    );
  }
}
