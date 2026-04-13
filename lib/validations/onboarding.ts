import { z } from "zod";

export const onboardingStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  sex: z.enum(["M", "F", "Other"], { required_error: "Sex is required" }),
});

export const onboardingStep2Schema = z.object({
  heightCm: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weightKg: z.number().min(20, "Weight must be at least 20kg").max(300, "Weight must be less than 300kg"),
  waistCm: z.number().min(40, "Waist must be at least 40cm"),
  ageYears: z.number().min(18, "Must be at least 18 years old").max(120),
});

export const onboardingStep3Schema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], {
    required_error: "Activity level is required",
  }),
  dietaryStyle: z.enum(["omnivore", "vegetarian", "pescatarian", "vegan"], {
    required_error: "Dietary style is required",
  }),
});

export const onboardingStep4Schema = z.object({
  waistLossGoalCm: z.number().min(1, "Goal must be at least 1cm"),
  timelineDays: z.number().min(30, "Timeline must be at least 30 days"),
});

export const onboardingStep5Schema = z.object({
  preferredCheckInTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  enableNotifications: z.boolean(),
});

export type OnboardingStep1 = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3 = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4 = z.infer<typeof onboardingStep4Schema>;
export type OnboardingStep5 = z.infer<typeof onboardingStep5Schema>;
