"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DailyPlan {
  id: string;
  date: string;
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  stepGoal: number;
  hydrationGoalLiters: number;
  coachingTip?: string;
}

interface UserMetrics {
  firstName?: string;
  lastName?: string;
  heightCm?: number;
  waistCm?: number;
  weight?: number;
}

interface CoachMessage {
  coach_message: string;
  plan_explanation: string;
  adjustments: string;
  tips: string[];
  warnings: string[];
  cached: boolean;
  fallback?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [coachData, setCoachData] = useState<CoachMessage | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's daily plan
        const planRes = await fetch("/api/users/dailyplan/today");
        if (planRes.ok) {
          const plan = await planRes.json();
          setDailyPlan(plan);
        }

        // Fetch user profile
        const profileRes = await fetch("/api/users/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserMetrics(profile);
        }

        // Fetch AI coach message
        setCoachLoading(true);
        try {
          const coachRes = await fetch("/api/ai/daily-coach", { method: "POST" });
          if (coachRes.ok) {
            const coach = await coachRes.json();
            setCoachData(coach);
          }
        } catch {
          // AI coaching is optional — don't block dashboard
        } finally {
          setCoachLoading(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/60 border border-red-200 text-red-700 px-6 py-4 rounded-zen">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-zen-600 to-moss-600 rounded-zen shadow-zen-lg p-8 text-white">
        <h1 className="text-3xl font-light mb-2">
          Welcome back, {userMetrics?.firstName} 🌿
        </h1>
        <p className="text-white/80">
          Let&apos;s work towards your waist loss goal today
        </p>
      </div>

      {/* Today's Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6 border-l-4 border-moss-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-zen-500 font-medium">Calories</h3>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-light text-zen-900">
            {dailyPlan?.calorieTarget || "—"}
          </p>
          <p className="text-sm text-zen-400 mt-1">Target kcal</p>
        </div>

        {/* Protein */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6 border-l-4 border-water-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-zen-500 font-medium">Protein</h3>
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-3xl font-light text-zen-900">
            {dailyPlan?.proteinTargetG || "—"}g
          </p>
          <p className="text-sm text-zen-400 mt-1">Daily target</p>
        </div>

        {/* Steps */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6 border-l-4 border-moss-400">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-zen-500 font-medium">Steps</h3>
            <span className="text-2xl">👟</span>
          </div>
          <p className="text-3xl font-light text-zen-900">
            {dailyPlan?.stepGoal?.toLocaleString() || "—"}
          </p>
          <p className="text-sm text-zen-400 mt-1">Daily goal</p>
        </div>

        {/* Hydration */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6 border-l-4 border-water-400">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-zen-500 font-medium">Hydration</h3>
            <span className="text-2xl">💧</span>
          </div>
          <p className="text-3xl font-light text-zen-900">
            {dailyPlan?.hydrationGoalLiters || "—"}L
          </p>
          <p className="text-sm text-zen-400 mt-1">Daily target</p>
        </div>
      </div>

      {/* Macronutrients Breakdown */}
      <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-8">
        <h2 className="text-2xl font-light text-zen-900 mb-6">
          Macronutrient Targets
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Protein */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-zen-500 font-medium">Protein</span>
              <span className="text-zen-900 font-semibold">
                {dailyPlan?.proteinTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div
                className="bg-water-500 h-2 rounded-full"
                style={{
                  width: `${
                    ((dailyPlan?.proteinTargetG || 0) /
                      (dailyPlan?.calorieTarget || 2000)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-zen-500 font-medium">Carbs</span>
              <span className="text-zen-900 font-semibold">
                {dailyPlan?.carbTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${
                    ((dailyPlan?.carbTargetG || 0) /
                      (dailyPlan?.calorieTarget || 2000)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-zen-500 font-medium">Fats</span>
              <span className="text-zen-900 font-semibold">
                {dailyPlan?.fatTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div
                className="bg-rose-400 h-2 rounded-full"
                style={{
                  width: `${
                    ((dailyPlan?.fatTargetG || 0) /
                      (dailyPlan?.calorieTarget || 2000)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach Message */}
      {coachLoading ? (
        <div className="bg-moss-50/60 border-l-4 border-moss-500 rounded-zen p-6 animate-pulse">
          <div className="h-5 bg-moss-200 rounded w-48 mb-3"></div>
          <div className="h-4 bg-moss-100 rounded w-full mb-2"></div>
          <div className="h-4 bg-moss-100 rounded w-3/4"></div>
        </div>
      ) : coachData ? (
        <div className="bg-moss-50/60 border-l-4 border-moss-500 rounded-zen p-6">
          <h3 className="text-lg font-medium text-moss-900 mb-2">
            🌱 Your Coach&apos;s Message Today
          </h3>
          <p className="text-moss-800 mb-4">{coachData.coach_message}</p>

          {/* Plan Explanation */}
          <details className="mb-3">
            <summary className="cursor-pointer text-sm font-medium text-moss-700 hover:text-moss-900 transition">
              💡 Why this plan?
            </summary>
            <p className="mt-2 text-sm text-moss-700 pl-4 border-l-2 border-moss-300">
              {coachData.plan_explanation}
            </p>
          </details>

          {/* Tips */}
          {coachData.tips.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-moss-800 mb-1">Today&apos;s tips:</p>
              <ul className="list-disc list-inside text-sm text-moss-700 space-y-1">
                {coachData.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {coachData.warnings.length > 0 && (
            <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-zen p-3">
              {coachData.warnings.map((w, i) => (
                <p key={i} className="text-sm text-amber-800">⚠️ {w}</p>
              ))}
            </div>
          )}
        </div>
      ) : dailyPlan?.coachingTip ? (
        <div className="bg-water-50/60 border-l-4 border-water-500 rounded-zen p-6">
          <h3 className="text-lg font-medium text-water-900 mb-2">
            💡 Today&apos;s Tip
          </h3>
          <p className="text-water-800">{dailyPlan.coachingTip}</p>
        </div>
      ) : null}

      {/* Check-In Button */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/checkin")}
          className="flex-1 bg-moss-500 hover:bg-moss-600 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen"
        >
          Log Daily Check-In
        </button>
        <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-zen-800 font-medium py-3 rounded-zen transition-all duration-300">
          View Progress
        </button>
      </div>
    </div>
  );
}
