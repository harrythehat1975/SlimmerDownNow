import { z } from "zod";

export const createCheckInSchema = z.object({
  weight: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().int().min(1).max(10),
  energyLevel: z.number().int().min(1).max(10),
  sorenessLevel: z.number().int().min(1).max(10),
  bloatingLevel: z.number().int().min(1).max(10),
  stepsCompleted: z.number().int().nonnegative(),
  dietAdherence: z.number().min(0).max(1),
  workoutAdherence: z.number().min(0).max(1),
  notes: z.string().max(500).optional(),
});

export type CreateCheckInRequest = z.infer<typeof createCheckInSchema>;
