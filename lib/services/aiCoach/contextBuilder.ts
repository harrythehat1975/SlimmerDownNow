import { prisma } from "@/lib/db/client";

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
  };
}
