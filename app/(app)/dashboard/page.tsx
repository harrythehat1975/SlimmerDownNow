"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userMetrics?.firstName}!
        </h1>
        <p className="text-indigo-100">
          Let&apos;s work towards your waist loss goal today
        </p>
      </div>

      {/* Today's Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-600">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-600 font-medium">Calories</h3>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyPlan?.calorieTarget || "—"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Target kcal</p>
        </div>

        {/* Protein */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-600 font-medium">Protein</h3>
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyPlan?.proteinTargetG || "—"}g
          </p>
          <p className="text-sm text-gray-500 mt-1">Daily target</p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-600 font-medium">Steps</h3>
            <span className="text-2xl">👟</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyPlan?.stepGoal?.toLocaleString() || "—"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Daily goal</p>
        </div>

        {/* Hydration */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-cyan-600">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-600 font-medium">Hydration</h3>
            <span className="text-2xl">💧</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dailyPlan?.hydrationGoalLiters || "—"}L
          </p>
          <p className="text-sm text-gray-500 mt-1">Daily target</p>
        </div>
      </div>

      {/* Macronutrients Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Macronutrient Targets
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Protein */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-medium">Protein</span>
              <span className="text-gray-900 font-bold">
                {dailyPlan?.proteinTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
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
              <span className="text-gray-600 font-medium">Carbs</span>
              <span className="text-gray-900 font-bold">
                {dailyPlan?.carbTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full"
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
              <span className="text-gray-600 font-medium">Fats</span>
              <span className="text-gray-900 font-bold">
                {dailyPlan?.fatTargetG || 0}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
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

      {/* Coaching Tip */}
      {dailyPlan?.coachingTip && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Today&apos;s Tip
          </h3>
          <p className="text-blue-800">{dailyPlan.coachingTip}</p>
        </div>
      )}

      {/* Check-In Button */}
      <div className="flex gap-4">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
          Log Daily Check-In
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition">
          View Progress
        </button>
      </div>
    </div>
  );
}
