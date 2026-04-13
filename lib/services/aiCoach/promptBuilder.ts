import type { AiCoachContext } from "./contextBuilder";

// ============================================================================
// SYSTEM PROMPT  — defines AI personality and hard boundaries.
// Shared across ALL task prompts.
// ============================================================================

export const SYSTEM_PROMPT = `You are Coach SDN, the AI coaching assistant for "Slimmer Down Now", a waist-loss coaching application.

PERSONALITY:
- Supportive but direct — celebrate wins, be honest about gaps
- Realistic — never promise "fast results" or use hype language
- Warm first name basis — use the user's first name naturally
- Brief — respect the user's time; no filler paragraphs

HARD RULES (never violate these):
1. You are NOT a doctor. Never diagnose, prescribe medication, or give specific medical advice.
2. If the user describes pain, dizziness, or symptoms, tell them to consult a healthcare professional.
3. Never recommend calorie intake below 1200 kcal/day for anyone.
4. Never recommend more than a 500 kcal/day deficit.
5. Never recommend fasting protocols or extreme diets.
6. Acknowledge injuries the user has reported — suggest modifications, not avoidance.
7. All output MUST be valid JSON matching the exact schema requested. No markdown, no extra keys.
8. Keep all responses concise and actionable.`;

// ============================================================================
// TASK PROMPTS  — one per endpoint. Each receives serialized context.
// ============================================================================

/**
 * Daily coaching message + plan explanation.
 * Called once per day per user; response is cached.
 */
export function buildDailyCoachPrompt(ctx: AiCoachContext): string {
  const checkInSummary =
    ctx.recentCheckIns.length > 0
      ? ctx.recentCheckIns
          .map(
            (ci) =>
              `${ci.date}: sleep=${ci.sleepHours}h, energy=${ci.energyLevel}/10, stress=${ci.stressLevel}/10, steps=${ci.stepsCompleted}, diet_adherence=${(ci.dietAdherence * 100).toFixed(0)}%, workout_adherence=${(ci.workoutAdherence * 100).toFixed(0)}%`
          )
          .join("\n")
      : "No check-ins recorded yet.";

  return `TASK: Generate today's coaching message and plan explanation for the user.

USER CONTEXT:
- Name: ${ctx.user.firstName}
- Sex: ${ctx.user.sex}, Height: ${ctx.user.heightCm}cm
- Activity level: ${ctx.user.activityLevel}
- Dietary style: ${ctx.user.dietaryStyle}
${ctx.user.injuries ? `- Injuries/limitations: ${ctx.user.injuries}` : ""}

CURRENT METRICS:
${ctx.currentMetrics ? `- Weight: ${ctx.currentMetrics.weightKg}kg, Waist: ${ctx.currentMetrics.waistCm}cm (as of ${ctx.currentMetrics.measurementDate})` : "- No measurements recorded yet."}

GOAL:
${ctx.goal ? `- Target waist: ${ctx.goal.targetWaistCm}cm, Pace: ${ctx.goal.targetPace}cm/week, Deadline: ${ctx.goal.deadlineWeeks} weeks` : "- No goal set."}

TODAY'S PLAN (from recommendation engine):
${ctx.todayPlan ? `- Calories: ${ctx.todayPlan.calorieTarget} kcal
- Protein: ${ctx.todayPlan.proteinTargetG}g, Carbs: ${ctx.todayPlan.carbTargetG}g, Fats: ${ctx.todayPlan.fatTargetG}g
- Step goal: ${ctx.todayPlan.stepGoal}
- Hydration: ${ctx.todayPlan.hydrationGoalLiters}L` : "- No plan generated yet."}

LAST 7 DAYS CHECK-INS:
${checkInSummary}

ADHERENCE SCORE (7-day rolling): ${(ctx.adherenceScore * 100).toFixed(0)}%
STREAK: ${ctx.streakDays} day(s)

INSTRUCTIONS:
1. Write a personalized "coach_message" (2-4 sentences). Reference specific data above — don't be generic.
2. Write a "plan_explanation" explaining WHY today's numbers are what they are, in plain language.
3. In "adjustments", note if anything should change based on recent check-ins (or say "none" if the plan is on track).
4. Provide 1-3 actionable "tips" for today.
5. Add "warnings" only if something concerning appears in the data (e.g., very low sleep, high stress streak). Otherwise return an empty array.

Respond with ONLY valid JSON matching this exact schema:
{
  "coach_message": "string",
  "plan_explanation": "string",
  "adjustments": "string",
  "tips": ["string"],
  "warnings": ["string"]
}`;
}

/**
 * Conversational chat — responds to a user message in context.
 */
export function buildChatPrompt(ctx: AiCoachContext, userMessage: string): string {
  return `TASK: Respond to the user's message as their waist-loss coach.

USER CONTEXT:
- Name: ${ctx.user.firstName}
- Activity level: ${ctx.user.activityLevel}, Dietary style: ${ctx.user.dietaryStyle}
${ctx.user.injuries ? `- Injuries/limitations: ${ctx.user.injuries}` : ""}
${ctx.currentMetrics ? `- Current weight: ${ctx.currentMetrics.weightKg}kg, waist: ${ctx.currentMetrics.waistCm}cm` : ""}
${ctx.todayPlan ? `- Today's plan: ${ctx.todayPlan.calorieTarget} kcal, ${ctx.todayPlan.stepGoal} steps` : ""}
- 7-day adherence: ${(ctx.adherenceScore * 100).toFixed(0)}%
- Streak: ${ctx.streakDays} day(s)

USER MESSAGE:
"${userMessage}"

INSTRUCTIONS:
1. Answer the user's question or respond to their statement.
2. Be concise (2-4 sentences max unless they asked for detail).
3. If their message implies a plan change (e.g., "I'm tired", "make it easier"), suggest up to 2 actions.
4. If they describe medical symptoms, advise seeing a healthcare professional.

Respond with ONLY valid JSON:
{
  "reply": "string",
  "suggested_actions": [{"label": "string", "action": "swap_meal|reduce_intensity|adjust_calories|skip_workout|none"}],
  "warnings": ["string"]
}`;
}

/**
 * Plan adjustment suggestions — when user requests a change.
 */
export function buildAdjustmentPrompt(
  ctx: AiCoachContext,
  reason: string
): string {
  return `TASK: Suggest adjusted daily plan numbers based on the user's request.

USER CONTEXT:
- Name: ${ctx.user.firstName}, Sex: ${ctx.user.sex}
- Activity level: ${ctx.user.activityLevel}
${ctx.currentMetrics ? `- Weight: ${ctx.currentMetrics.weightKg}kg, Waist: ${ctx.currentMetrics.waistCm}cm` : ""}
${ctx.user.injuries ? `- Injuries: ${ctx.user.injuries}` : ""}

CURRENT PLAN:
${ctx.todayPlan ? `- Calories: ${ctx.todayPlan.calorieTarget}, Protein: ${ctx.todayPlan.proteinTargetG}g, Carbs: ${ctx.todayPlan.carbTargetG}g, Fats: ${ctx.todayPlan.fatTargetG}g
- Steps: ${ctx.todayPlan.stepGoal}, Hydration: ${ctx.todayPlan.hydrationGoalLiters}L` : "No current plan."}

RECENT 7-DAY ADHERENCE: ${(ctx.adherenceScore * 100).toFixed(0)}%

REASON FOR ADJUSTMENT:
"${reason}"

RULES:
- Calories MUST stay between 1200 and 4000.
- Deficit MUST NOT exceed 500 kcal from estimated TDEE.
- Do NOT suggest extreme changes. Incremental is better.
- Protein should stay above 0.7g per lb of body weight.

Respond with ONLY valid JSON:
{
  "reasoning": "string explaining why these numbers",
  "suggested_calories": number,
  "suggested_protein_g": number,
  "suggested_carbs_g": number,
  "suggested_fats_g": number,
  "suggested_step_goal": number,
  "confidence": "low|medium|high",
  "warnings": ["string"]
}`;
}
