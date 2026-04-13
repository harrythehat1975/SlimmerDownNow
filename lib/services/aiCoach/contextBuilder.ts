import { prisma } from "@/lib/db/client";
import type { UserState, BehavioralAnalytics } from "./schemas";

// ============================================================================
// AI Context: the structured data object sent to every AI prompt.
// Gathered from DB; never passed raw DB rows to the LLM.
// ============================================================================

export interface AiCoachContext {
  user: {
    firstName: string;
    sex: string;
    age: number | null;
    heightCm: number;
    activityLevel: string;
    dietaryStyle: string;
    injuries: string | null;
  };
  currentMetrics: {
    weightKg: number;
    waistCm: number;
    measurementDate: string;
  } | null;
  goal: {
    targetWaistCm: number;
    targetPace: number; // cm/week
    deadlineWeeks: number;
    status: string;
  } | null;
  todayPlan: {
    calorieTarget: number;
    proteinTargetG: number;
    carbTargetG: number;
    fatTargetG: number;
    stepGoal: number;
    hydrationGoalLiters: number;
  } | null;
  recentCheckIns: {
    date: string;
    sleepHours: number;
    stressLevel: number;
    energyLevel: number;
    bloatingLevel: number;
    stepsCompleted: number;
    dietAdherence: number;
    workoutAdherence: number;
    weight: number | null;
    waistCm: number | null;
  }[];
  adherenceScore: number; // 0-1, rolling 7-day average
  streakDays: number;
  userState: UserState;
  analytics: BehavioralAnalytics;
}

/**
 * Build the AI coaching context for a given user.
 * Queries only what the LLM needs — no PII leaks, no bloat.
 */
export async function buildCoachContext(userId: string): Promise<AiCoachContext> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Parallel queries — one round-trip
  const [profile, latestMetrics, goal, todayPlan, recentCheckIns] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.bodyMetrics.findFirst({
      where: { userId },
      orderBy: { measurementDate: "desc" },
    }),
    prisma.goal.findUnique({ where: { userId } }),
    prisma.dailyPlan.findFirst({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
      },
    }),
    prisma.dailyCheckIn.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  // Calculate rolling adherence score
  let adherenceScore = 0;
  if (recentCheckIns.length > 0) {
    const totalAdherence = recentCheckIns.reduce(
      (sum, ci) => sum + (ci.dietAdherence + ci.workoutAdherence) / 2,
      0
    );
    adherenceScore = Math.round((totalAdherence / recentCheckIns.length) * 100) / 100;
  }

  // Calculate streak (consecutive days with check-in)
  let streakDays = 0;
  const sortedCheckIns = [...recentCheckIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (let i = 0; i < sortedCheckIns.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    expected.setHours(0, 0, 0, 0);
    const ciDate = new Date(sortedCheckIns[i].date);
    ciDate.setHours(0, 0, 0, 0);
    if (ciDate.getTime() === expected.getTime()) {
      streakDays++;
    } else {
      break;
    }
  }

  return {
    user: {
      firstName: profile?.firstName || "there",
      sex: profile?.sex || "Other",
      age: null, // Derived from dateOfBirth if available
      heightCm: profile?.heightCm || 170,
      activityLevel: profile?.activityLevel || "moderate",
      dietaryStyle: profile?.dietaryStyle || "omnivore",
      injuries: profile?.injuries || null,
    },
    currentMetrics: latestMetrics
      ? {
          weightKg: latestMetrics.currentWeightKg,
          waistCm: latestMetrics.currentWaistCm,
          measurementDate: latestMetrics.measurementDate.toISOString().split("T")[0],
        }
      : null,
    goal: goal
      ? {
          targetWaistCm: goal.targetWaistCm,
          targetPace: goal.targetPace,
          deadlineWeeks: goal.targetDatelineWeeks,
          status: goal.status,
        }
      : null,
    todayPlan: todayPlan
      ? {
          calorieTarget: todayPlan.calorieTarget,
          proteinTargetG: todayPlan.proteinTargetG,
          carbTargetG: todayPlan.carbTargetG,
          fatTargetG: todayPlan.fatTargetG,
          stepGoal: todayPlan.stepGoal,
          hydrationGoalLiters: todayPlan.hydrationGoalLiters,
        }
      : null,
    recentCheckIns: recentCheckIns.map((ci) => ({
      date: ci.date.toISOString().split("T")[0],
      sleepHours: ci.sleepHours,
      stressLevel: ci.stressLevel,
      energyLevel: ci.energyLevel,
      bloatingLevel: ci.bloatingLevel,
      stepsCompleted: ci.stepsCompleted,
      dietAdherence: ci.dietAdherence,
      workoutAdherence: ci.workoutAdherence,
      weight: ci.weight,
      waistCm: ci.waistCm,
    })),
    adherenceScore,
    streakDays,
    userState: classifyUserState(recentCheckIns, adherenceScore, streakDays),
    analytics: computeBehavioralAnalytics(recentCheckIns, adherenceScore, streakDays),
  };
}

// ============================================================================
// Daily user-state classification
// ============================================================================

/** Raw check-in shape from Prisma (before date → string mapping) */
interface RawCheckIn {
  dietAdherence: number;
  workoutAdherence: number;
  energyLevel: number;
  weight: number | null;
}

function classifyUserState(
  checkIns: RawCheckIn[],
  adherence: number,
  streak: number
): UserState {
  // New user: fewer than 3 check-ins in the last 7 days
  if (checkIns.length < 3) return "new_user";

  // Plateau: weight variance < 0.3 kg over last 7 check-ins with decent adherence
  const weights = checkIns.map((ci) => ci.weight).filter((w): w is number => w !== null);
  if (weights.length >= 3 && adherence >= 0.6) {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    if (max - min < 0.3) return "plateaued";
  }

  // High performer: adherence ≥ 0.8 and streak ≥ 4
  if (adherence >= 0.8 && streak >= 4) return "high_performer";

  // Struggling: adherence < 0.4
  if (adherence < 0.4) return "struggling";

  // Inconsistent: everything else (moderate adherence but spotty)
  return "inconsistent";
}

// ============================================================================
// Behavioral analytics — derived signals for smarter coaching
// ============================================================================

function computeBehavioralAnalytics(
  checkIns: RawCheckIn[],
  adherence: number,
  streak: number
): BehavioralAnalytics {
  const state = classifyUserState(checkIns, adherence, streak);

  // --- Adherence trend (compare first-half vs second-half of 7-day window) ---
  let adherenceTrend: BehavioralAnalytics["adherenceTrend"] = "stable";
  if (checkIns.length >= 4) {
    const mid = Math.floor(checkIns.length / 2);
    // checkIns are sorted newest-first
    const recentHalf = checkIns.slice(0, mid);
    const olderHalf = checkIns.slice(mid);
    const avg = (arr: typeof checkIns) =>
      arr.reduce((s, c) => s + (c.dietAdherence + c.workoutAdherence) / 2, 0) / arr.length;
    const diff = avg(recentHalf) - avg(olderHalf);
    if (diff > 0.1) adherenceTrend = "improving";
    else if (diff < -0.1) adherenceTrend = "declining";
  }

  // --- Plateau detection (same as classifyUserState) ---
  let plateauDetected = false;
  const weights = checkIns.map((ci) => ci.weight).filter((w): w is number => w !== null);
  if (weights.length >= 3 && adherence >= 0.6) {
    plateauDetected = Math.max(...weights) - Math.min(...weights) < 0.3;
  }

  // --- Energy trend ---
  let energyTrend: BehavioralAnalytics["energyTrend"] = "up";
  if (checkIns.length >= 2) {
    const recentEnergy = checkIns.slice(0, Math.ceil(checkIns.length / 2))
      .reduce((s, c) => s + c.energyLevel, 0) / Math.ceil(checkIns.length / 2);
    const olderEnergy = checkIns.slice(Math.ceil(checkIns.length / 2))
      .reduce((s, c) => s + c.energyLevel, 0) / Math.floor(checkIns.length / 2);
    if (recentEnergy < olderEnergy - 0.3) energyTrend = "down";
  }

  // --- Consistency score (0-100) ---
  const consistencyScore = Math.round(adherence * 100);

  // --- Risk level ---
  let riskLevel: BehavioralAnalytics["riskLevel"] = "low";
  if (adherence < 0.4 || (adherenceTrend === "declining" && streak < 2)) {
    riskLevel = "high";
  } else if (adherence < 0.6 || adherenceTrend === "declining") {
    riskLevel = "medium";
  }

  // --- Likely dropoff: high risk + declining + low energy ---
  const likelyDropoff =
    riskLevel === "high" && adherenceTrend === "declining" && energyTrend === "down";

  return {
    userState: state,
    adherenceTrend,
    plateauDetected,
    energyTrend,
    consistencyScore,
    riskLevel,
    likelyDropoff,
  };
}
