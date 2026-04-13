import { prisma } from "@/lib/db/client";
import type { AiCoachResponse, AiAdjustmentResponse } from "./schemas";

// ============================================================================
// Response Parser — post-processing, safety enforcement, and caching.
// Sits between raw AI output and what reaches the user.
// ============================================================================

const CALORIE_FLOOR = 1200;
const CALORIE_CEILING = 4000;
const MAX_DEFICIT = 500;

/**
 * Enforce safety bounds on an adjustment response.
 * Clamps values that the AI might have set outside safe ranges.
 */
export function enforceAdjustmentBounds(
  response: AiAdjustmentResponse,
  currentTdeeEstimate?: number
): AiAdjustmentResponse {
  const clamped = { ...response };

  // Hard calorie floor/ceiling
  clamped.suggested_calories = Math.max(
    CALORIE_FLOOR,
    Math.min(CALORIE_CEILING, clamped.suggested_calories)
  );

  // If we know TDEE, enforce max deficit
  if (currentTdeeEstimate) {
    const minAllowed = currentTdeeEstimate - MAX_DEFICIT;
    if (clamped.suggested_calories < minAllowed) {
      clamped.suggested_calories = Math.max(CALORIE_FLOOR, minAllowed);
      clamped.warnings = [
        ...clamped.warnings,
        "Calorie target was adjusted to stay within a safe deficit range.",
      ];
    }
  }

  // Clamp macros
  clamped.suggested_protein_g = Math.max(40, Math.min(300, clamped.suggested_protein_g));
  clamped.suggested_carbs_g = Math.max(50, Math.min(500, clamped.suggested_carbs_g));
  clamped.suggested_fats_g = Math.max(20, Math.min(200, clamped.suggested_fats_g));
  clamped.suggested_step_goal = Math.max(2000, Math.min(25000, clamped.suggested_step_goal));

  return clamped;
}

/**
 * Strip any text that looks like medical advice from coach messages.
 */
export function sanitizeCoachMessage(message: string): string {
  const medicalPatterns = [
    /you should take \w+ medication/gi,
    /I recommend \w+ supplements/gi,
    /diagnos(e|is|ed)/gi,
    /prescription/gi,
  ];

  let sanitized = message;
  for (const pattern of medicalPatterns) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(
        pattern,
        "[Please consult a healthcare professional for medical advice]"
      );
    }
  }

  return sanitized;
}

// ============================================================================
// Cache Layer — store and retrieve daily coaching responses
// ============================================================================

/**
 * Get cached daily coaching response for a user (valid for today only).
 */
export async function getCachedDailyCoach(userId: string): Promise<AiCoachResponse | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cached = await prisma.auditLog.findFirst({
    where: {
      userId,
      action: "ai_daily_coach",
      createdAt: { gte: today },
    },
    orderBy: { createdAt: "desc" },
  });

  if (cached?.changes) {
    try {
      return cached.changes as unknown as AiCoachResponse;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Cache a daily coaching response for a user.
 */
export async function cacheDailyCoach(
  userId: string,
  response: AiCoachResponse
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action: "ai_daily_coach",
      resourceType: "AiCoachResponse",
      resourceId: userId,
      changes: response as any,
    },
  });
}
