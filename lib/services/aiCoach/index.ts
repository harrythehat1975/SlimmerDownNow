// ============================================================================
// lib/services/aiCoach  — AI coaching layer.
//
// Architecture:
//   recommendationEngine (deterministic) → structured plan
//   contextBuilder (DB queries)          → AiCoachContext
//   promptBuilder (templates)            → LLM prompt string
//   aiClient (OpenAI SDK)                → raw JSON
//   schemas (Zod)                        → validated response
//   responseParser (safety + cache)      → safe, cached output
// ============================================================================

export { callAi } from "./aiClient";
export { buildCoachContext } from "./contextBuilder";
export type { AiCoachContext } from "./contextBuilder";
export {
  buildDailyCoachPrompt,
  buildChatPrompt,
  buildAdjustmentPrompt,
  buildSystemPrompt,
  SYSTEM_PROMPT,
} from "./promptBuilder";
export {
  aiCoachResponseSchema,
  aiChatResponseSchema,
  aiAdjustmentResponseSchema,
  behavioralAnalyticsSchema,
  userStateSchema,
  USER_STATES,
} from "./schemas";
export type {
  AiCoachResponse,
  AiChatResponse,
  AiAdjustmentResponse,
  BehavioralAnalytics,
  UserState,
} from "./schemas";
export {
  enforceAdjustmentBounds,
  sanitizeCoachMessage,
  getCachedDailyCoach,
  cacheDailyCoach,
} from "./responseParser";
