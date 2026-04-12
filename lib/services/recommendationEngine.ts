import { CALORIE_MINIMUM } from "../utils/constants";

interface UserMetrics {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "M" | "F" | "Other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

interface RecommendationConfig {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  stepGoal: number;
  hydrationLiters: number;
}

/**
 * Calculate BMR using Mifflin-St Jeor equation (industry standard)
 */
function calculateBMR(metrics: UserMetrics): number {
  const { weightKg, heightCm, age, sex } = metrics;

  if (sex === "M") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (sex === "F") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  // Conservative estimate for Other
  return (
    (10 * weightKg +
      6.25 * heightCm -
      5 * age +
      5 +
      10 * weightKg +
      6.25 * heightCm -
      5 * age -
      161) /
    2
  );
}

/**
 * Activity Level Multipliers (TDEE = BMR × multiplier)
 */
function getActivityMultiplier(level: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[level] || 1.55;
}

/**
 * Calculate daily calorie target for waist loss
 * Goal: ~0.5-1 lb loss per week = ~250-500 cal deficit per day
 */
function calculateCalorieTarget(
  tdee: number,
  weightLossGoalPerWeek: number,
  minimumCalories: number = CALORIE_MINIMUM
): number {
  const dailyDeficitNeeded = weightLossGoalPerWeek * 500;
  const target = Math.max(tdee - dailyDeficitNeeded, minimumCalories);
  return Math.round(target);
}

/**
 * Protein target: 0.8-1.2g per lb depending on activity
 */
function calculateProteinTarget(weightKg: number, activityLevel: string): number {
  const weightLbs = weightKg * 2.20462;

  let proteinPerLb = 0.8;
  if (activityLevel === "active" || activityLevel === "very_active") {
    proteinPerLb = 1.1;
  } else if (activityLevel === "moderate") {
    proteinPerLb = 0.95;
  }

  return Math.round(weightLbs * proteinPerLb);
}

/**
 * Macro distribution: 30% protein, 40% carbs, 30% fats
 */
function calculateMacros(
  calories: number,
  proteinG: number
): { proteinG: number; carbsG: number; fatsG: number } {
  const proteinCals = proteinG * 4;
  const remainingCals = calories - proteinCals;

  const carbsG = Math.round((remainingCals * 0.4) / 4);
  const fatsG = Math.round((remainingCals * 0.6) / 9);

  return { proteinG, carbsG, fatsG };
}

/**
 * Step goal based on activity level
 */
function calculateStepGoal(activityLevel: string): number {
  const stepGoals: Record<string, number> = {
    sedentary: 5000,
    light: 7000,
    moderate: 10000,
    active: 12000,
    very_active: 15000,
  };
  return stepGoals[activityLevel] || 10000;
}

/**
 * Generate daily recommendation config
 */
export function generateDailyRecommendation(
  userMetrics: UserMetrics,
  goalWeightLossLbsPerWeek: number = 1
): RecommendationConfig {
  const bmr = calculateBMR(userMetrics);
  const activityMultiplier = getActivityMultiplier(userMetrics.activityLevel);
  const tdee = bmr * activityMultiplier;

  const calories = calculateCalorieTarget(tdee, goalWeightLossLbsPerWeek);
  const proteinG = calculateProteinTarget(userMetrics.weightKg, userMetrics.activityLevel);
  const { carbsG, fatsG } = calculateMacros(calories, proteinG);

  return {
    calories,
    proteinG,
    carbsG,
    fatsG,
    stepGoal: calculateStepGoal(userMetrics.activityLevel),
    hydrationLiters: Math.max(2.5, userMetrics.weightKg * 0.033),
  };
}

export type { UserMetrics, RecommendationConfig };
