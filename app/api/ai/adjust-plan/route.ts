import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  buildCoachContext,
  buildAdjustmentPrompt,
  callAi,
  aiAdjustmentResponseSchema,
  enforceAdjustmentBounds,
} from "@/lib/services/aiCoach";
import type { AiAdjustmentResponse } from "@/lib/services/aiCoach";
import { z } from "zod";

// ============================================================================
// POST /api/ai/adjust-plan
//
// User requests a plan modification. AI suggests adjusted numbers.
// All suggestions are validated + safety-clamped before return.
// ============================================================================

const requestSchema = z.object({
  reason: z.string().min(1).max(500),
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

    // 4. Build prompt
    const prompt = buildAdjustmentPrompt(context, parsed.data.reason);

    // 5. Call AI
    const response = await callAi<AiAdjustmentResponse>({
      userPrompt: prompt,
      schema: aiAdjustmentResponseSchema,
      userState: context.userState,
      maxRetries: 2,
      temperature: 0.5, // Lower temp for numeric outputs
      maxTokens: 512,
    });

    // 6. Enforce safety bounds (deterministic post-processing)
    const tdeeEstimate = context.todayPlan
      ? context.todayPlan.calorieTarget + 400 // Rough reverse-estimate
      : undefined;
    const safe = enforceAdjustmentBounds(response, tdeeEstimate);

    return NextResponse.json(safe);
  } catch (error) {
    console.error("[adjust-plan] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate adjustment. Please try again." },
      { status: 500 }
    );
  }
}
