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
        const planRes = await fetch("/api/users/dailyplan/today");
        if (planRes.ok) {
          const plan = await planRes.json();
          setDailyPlan(plan);
        }

        const profileRes = await fetch("/api/users/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserMetrics(profile);
        }

        setCoachLoading(true);
        try {
          const coachRes = await fetch("/api/ai/daily-coach", { method: "POST" });
          if (coachRes.ok) {
            const coach = await coachRes.json();
            setCoachData(coach);
          }
        } catch {
          // AI coaching is optional
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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
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
      <div className="zen-card bg-sage-900 p-8">
        <h1 className="text-3xl font-light text-sand-50 mb-2">
          Welcome back, {userMetrics?.firstName}
        </h1>
        <p className="text-sand-200/80">
          Stay consistent today — every small step matters.
        </p>
      </div>

      {/* Today's Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="zen-card border-l-4 border-sage-600">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-earth-500 font-medium text-sm">Calories</h3>
          </div>
          <p className="text-3xl font-light text-earth-900">
            {dailyPlan?.calorieTarget || "—"}
          </p>
          <p className="text-sm text-earth-400 mt-1">Target kcal</p>
        </div>

        <div className="zen-card border-l-4 border-sage-400">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-earth-500 font-medium text-sm">Protein</h3>
          </div>
          <p className="text-3xl font-light text-earth-900">
            {dailyPlan?.proteinTargetG || "—"}g
          </p>
          <p className="text-sm text-earth-400 mt-1">Daily target</p>
        </div>

        <div className="zen-card border-l-4 border-sage-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-earth-500 font-medium text-sm">Steps</h3>
          </div>
          <p className="text-3xl font-light text-earth-900">
            {dailyPlan?.stepGoal?.toLocaleString() || "—"}
          </p>
          <p className="text-sm text-earth-400 mt-1">Daily goal</p>
        </div>

        <div className="zen-card border-l-4 border-sage-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-earth-500 font-medium text-sm">Hydration</h3>
          </div>
          <p className="text-3xl font-light text-earth-900">
            {dailyPlan?.hydrationGoalLiters || "—"}L
          </p>
          <p className="text-sm text-earth-400 mt-1">Daily target</p>
        </div>
      </div>

      {/* Macronutrients Breakdown */}
      <div className="zen-card">
        <h2 className="zen-section-title">
          Macronutrient Targets
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-earth-500 font-medium text-sm">Protein</span>
              <span className="text-earth-900 font-medium text-sm">
                {dailyPlan?.proteinTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-2">
              <div
                className="bg-sage-600 h-2 rounded-full transition-all duration-500"
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

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-earth-500 font-medium text-sm">Carbs</span>
              <span className="text-earth-900 font-medium text-sm">
                {dailyPlan?.carbTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-2">
              <div
                className="bg-sage-400 h-2 rounded-full transition-all duration-500"
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

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-earth-500 font-medium text-sm">Fats</span>
              <span className="text-earth-900 font-medium text-sm">
                {dailyPlan?.fatTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-2">
              <div
                className="bg-earth-400 h-2 rounded-full transition-all duration-500"
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
        <div className="zen-card border-l-4 border-sage-400 animate-pulse">
          <div className="h-5 bg-sand-200 rounded w-48 mb-3"></div>
          <div className="h-4 bg-sand-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-sand-200 rounded w-3/4"></div>
        </div>
      ) : coachData ? (
        <div className="zen-card border-l-4 border-sage-500">
          <h3 className="text-lg font-medium text-sage-900 mb-2">
            Your Coach&apos;s Message Today
          </h3>
          <p className="text-earth-700 mb-4">{coachData.coach_message}</p>

          <details className="mb-3">
            <summary className="cursor-pointer text-sm font-medium text-sage-700 hover:text-sage-900 transition">
              Why this plan?
            </summary>
            <p className="mt-2 text-sm text-earth-600 pl-4 border-l-2 border-sage-300">
              {coachData.plan_explanation}
            </p>
          </details>

          {coachData.tips.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-earth-700 mb-1">Today&apos;s tips:</p>
              <ul className="list-disc list-inside text-sm text-earth-600 space-y-1">
                {coachData.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {coachData.warnings.length > 0 && (
            <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-zen p-3">
              {coachData.warnings.map((w, i) => (
                <p key={i} className="text-sm text-amber-800">{w}</p>
              ))}
            </div>
          )}
        </div>
      ) : dailyPlan?.coachingTip ? (
        <div className="zen-card border-l-4 border-sage-400">
          <h3 className="text-lg font-medium text-earth-800 mb-2">
            Today&apos;s Tip
          </h3>
          <p className="text-earth-600">{dailyPlan.coachingTip}</p>
        </div>
      ) : null}

      {/* Check-In Button */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/checkin")}
          className="zen-btn flex-1 py-3"
        >
          Log Daily Check-In
        </button>
        <button className="zen-btn-secondary flex-1 py-3">
          View Progress
        </button>
      </div>
    </div>
  );
}
