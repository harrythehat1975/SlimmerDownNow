import { z } from "zod";

// ============================================================================
// AI Coach Response Schema
// All AI outputs MUST conform to this shape. Validated before display.
// ============================================================================

export const aiCoachResponseSchema = z.object({
  coach_message: z
    .string()
    .min(10, "Coach message must be at least 10 characters")
    .max(1500, "Coach message must be under 1500 characters"),
  plan_explanation: z
    .string()
    .min(10, "Plan explanation must be at least 10 characters")
    .max(2000, "Plan explanation must be under 2000 characters"),
  adjustments: z
    .string()
    .max(1000, "Adjustments must be under 1000 characters"),
  tips: z
    .array(z.string().max(300))
    .min(1, "Must include at least one tip")
    .max(5, "Maximum 5 tips"),
  warnings: z
    .array(z.string().max(300))
    .max(3, "Maximum 3 warnings"),
});

export type AiCoachResponse = z.infer<typeof aiCoachResponseSchema>;

// ============================================================================
// AI Chat Response Schema (for conversational endpoint)
// ============================================================================

export const aiChatResponseSchema = z.object({
  reply: z
    .string()
    .min(1)
    .max(2000, "Reply must be under 2000 characters"),
  suggested_actions: z
    .array(
      z.object({
        label: z.string().max(50),
        action: z.enum(["swap_meal", "reduce_intensity", "adjust_calories", "skip_workout", "none"]),
      })
    )
    .max(3),
  warnings: z
    .array(z.string().max(300))
    .max(3),
});

export type AiChatResponse = z.infer<typeof aiChatResponseSchema>;

// ============================================================================
// AI Adjustment Response Schema
// ============================================================================

export const aiAdjustmentResponseSchema = z.object({
  reasoning: z
    .string()
    .min(10)
    .max(1000),
  suggested_calories: z
    .number()
    .int()
    .min(1200, "Calorie target cannot go below 1200")
    .max(4000, "Calorie target cannot exceed 4000"),
  suggested_protein_g: z.number().min(40).max(300),
  suggested_carbs_g: z.number().min(50).max(500),
  suggested_fats_g: z.number().min(20).max(200),
  suggested_step_goal: z.number().int().min(2000).max(25000),
  confidence: z.enum(["low", "medium", "high"]),
  warnings: z.array(z.string().max(300)).max(3),
});

export type AiAdjustmentResponse = z.infer<typeof aiAdjustmentResponseSchema>;
