import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

// ============================================================================
// POST /api/ai/daily-coach
//
// Returns today's personalized coaching message + plan explanation.
// Generates once per day, then serves from cache.
// ============================================================================

export async function POST() {
  try {
    // Lazy-import AI modules to avoid build-time evaluation
    const {
      buildCoachContext,
      buildDailyCoachPrompt,
      callAi,
      aiCoachResponseSchema,
      sanitizeCoachMessage,
      getCachedDailyCoach,
      cacheDailyCoach,
    } = await import("@/lib/services/aiCoach");
    type AiCoachResponse = import("@/lib/services/aiCoach").AiCoachResponse;

    // 1. Auth check
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check cache first (cost control — one AI call per user per day)
    const cached = await getCachedDailyCoach(userId);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // 3. Build context from DB
    const context = await buildCoachContext(userId);

    // 4. Build prompt
    const prompt = buildDailyCoachPrompt(context);

    // 5. Call AI with Zod validation
    const response = await callAi<AiCoachResponse>({
      userPrompt: prompt,
      schema: aiCoachResponseSchema,
      userState: context.userState,
      maxRetries: 2,
      temperature: 0.7,
      maxTokens: 1024,
    });

    // 6. Post-process: sanitize coach message
    response.coach_message = sanitizeCoachMessage(response.coach_message);

    // 7. Cache for the rest of the day
    await cacheDailyCoach(userId, response);

    return NextResponse.json({ ...response, cached: false });
  } catch (error) {
    console.error("[daily-coach] Error:", error);

    // Graceful degradation — return static fallback if AI fails
    const fallback = {
      coach_message:
        "Great to see you today! Keep focusing on consistency — small daily habits lead to lasting results.",
      plan_explanation:
        "Your plan is based on your body metrics and activity level, designed for steady and sustainable waist loss.",
      adjustments: "none",
      tips: [
        "Try to hit your step goal today — even a short walk after meals helps.",
        "Stay hydrated throughout the day.",
      ],
      warnings: [],
    };

    return NextResponse.json({
      ...fallback,
      cached: false,
      fallback: true,
    });
  }
}
