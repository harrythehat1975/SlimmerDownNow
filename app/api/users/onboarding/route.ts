import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db/client";
import { generateDailyRecommendation } from "@/lib/services/recommendationEngine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      sex,
      heightCm,
      weightKg,
      waistCm,
      ageYears,
      activityLevel,
      dietaryStyle,
      waistLossGoalCm,
      timelineDays,
      preferredCheckInTime,
      enableNotifications,
    } = body;

    // Create/update user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        firstName,
        lastName,
        sex,
        heightCm,
        activityLevel,
        workoutExperience: "beginner",
        workoutLocation: "home",
        dietaryStyle,
        cookingTimeAvailable: "moderate",
        budgetLevel: "medium",
        onboardingCompleted: true,
      },
      update: {
        firstName,
        lastName,
        sex,
        heightCm,
        activityLevel,
        dietaryStyle,
        onboardingCompleted: true,
      },
    });

    // Record initial body metrics
    await prisma.bodyMetrics.create({
      data: {
        userId,
        currentWeightKg: weightKg,
        currentWaistCm: waistCm,
        measurementDate: new Date(),
      },
    });

    // Create goal
    const goal = await prisma.goal.upsert({
      where: { userId },
      create: {
        userId,
        targetWaistCm: waistCm - waistLossGoalCm,
        targetDatelineWeeks: Math.ceil(timelineDays / 7),
        targetPace: waistLossGoalCm / (timelineDays / 7),
        secondaryGoals: [],
        status: "active",
      },
      update: {
        targetWaistCm: waistCm - waistLossGoalCm,
        targetDatelineWeeks: Math.ceil(timelineDays / 7),
        targetPace: waistLossGoalCm / (timelineDays / 7),
        status: "active",
      },
    });

    // Create notification preferences
    await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        dailyPlanReminderEnabled: enableNotifications,
        dailyPlanReminderTime: preferredCheckInTime,
      },
      update: {
        dailyPlanReminderEnabled: enableNotifications,
        dailyPlanReminderTime: preferredCheckInTime,
      },
    });

    // Generate initial daily plan recommendation
    const recommendation = generateDailyRecommendation({
      weightKg,
      heightCm,
      age: ageYears,
      sex,
      activityLevel: activityLevel as any,
    });

    // Create initial daily plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyPlan = await prisma.dailyPlan.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        calorieTarget: recommendation.calories,
        proteinTargetG: recommendation.proteinG,
        carbTargetG: recommendation.carbsG,
        fatTargetG: recommendation.fatsG,
        stepGoal: recommendation.stepGoal,
        hydrationGoalLiters: recommendation.hydrationLiters,
        coachingTip: "Welcome to your personalized nutrition plan! This has been tailored to your unique metrics and goals.",
        generatedAt: today,
      },
      update: {
        calorieTarget: recommendation.calories,
        proteinTargetG: recommendation.proteinG,
        carbTargetG: recommendation.carbsG,
        fatTargetG: recommendation.fatsG,
        stepGoal: recommendation.stepGoal,
        hydrationGoalLiters: recommendation.hydrationLiters,
        coachingTip: "Welcome to your personalized nutrition plan! This has been tailored to your unique metrics and goals.",
        generatedAt: today,
      },
    });

    return NextResponse.json(
      {
        message: "Onboarding completed successfully",
        profile,
        goal,
        dailyPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
