import { z } from "zod";

export const onboardingSchema = z.object({
  // Profile
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  sex: z.enum(["M", "F", "Other"]),
  dateOfBirth: z.coerce.date(),

  // Metrics
  heightCm: z.number().int().positive("Height must be positive"),
  weightKg: z.number().positive("Weight must be positive"),
  waistCm: z.number().positive("Waist circumference must be positive"),

  // Activity
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workoutExperience: z.enum(["beginner", "intermediate", "advanced"]),
  workoutLocation: z.enum(["home", "gym", "both"]),
  minWorkoutMinutesPerWeek: z.number().int().positive().default(150),
  daysPerWeekAvailable: z.number().int().min(1).max(7),

  // Preferences
  dietaryStyle: z.enum(["omnivore", "vegetarian", "pescatarian"]),
  allergies: z.array(z.string()).default([]),
  mealsPerDay: z.number().int().min(2).max(5).default(3),
  cookingTimeAvailable: z.enum(["minimal", "moderate", "lots"]),
  budgetLevel: z.enum(["low", "medium", "high"]),
  injuries: z.string().optional(),

  // Goals
  targetWaistCm: z.number().positive("Target waist must be positive"),
  timelineWeeks: z.number().int().positive("Timeline must be positive"),
});

export type OnboardingRequest = z.infer<typeof onboardingSchema>;
