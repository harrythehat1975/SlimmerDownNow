"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckInPage() {
  const { status } = useSession();
  const router = useRouter();
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    waistCm: "",
    sleepHours: "7",
    stressLevel: "5",
    energyLevel: "5",
    sorenessLevel: "3",
    bloatingLevel: "3",
    stepsCompleted: "0",
    dietAdherence: "0.8",
    workoutAdherence: "0.8",
    notes: "",
  });

  // Check if already checked in today
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/users/checkin")
      .then((r) => r.json())
      .then((data) => {
        if (data.completed && data.checkin) {
          setAlreadyDone(true);
          setForm({
            weight: data.checkin.weight?.toString() || "",
            waistCm: data.checkin.waistCm?.toString() || "",
            sleepHours: data.checkin.sleepHours.toString(),
            stressLevel: data.checkin.stressLevel.toString(),
            energyLevel: data.checkin.energyLevel.toString(),
            sorenessLevel: data.checkin.sorenessLevel.toString(),
            bloatingLevel: data.checkin.bloatingLevel.toString(),
            stepsCompleted: data.checkin.stepsCompleted.toString(),
            dietAdherence: data.checkin.dietAdherence.toString(),
            workoutAdherence: data.checkin.workoutAdherence.toString(),
            notes: data.checkin.notes || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        sleepHours: parseFloat(form.sleepHours),
        stressLevel: parseInt(form.stressLevel),
        energyLevel: parseInt(form.energyLevel),
        sorenessLevel: parseInt(form.sorenessLevel),
        bloatingLevel: parseInt(form.bloatingLevel),
        stepsCompleted: parseInt(form.stepsCompleted),
        dietAdherence: parseFloat(form.dietAdherence),
        workoutAdherence: parseFloat(form.workoutAdherence),
      };

      if (form.weight) body.weight = parseFloat(form.weight);
      if (form.waistCm) body.waistCm = parseFloat(form.waistCm);
      if (form.notes.trim()) body.notes = form.notes.trim();

      const res = await fetch("/api/users/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-8 animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-stone-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-8 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-light text-zen-900 mb-2">Check-In Saved!</h2>
          <p className="text-zen-500">Great job staying consistent. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const sliderLabel = (value: string, labels: string[]) => {
    const v = parseInt(value);
    if (v <= 3) return labels[0];
    if (v <= 6) return labels[1];
    return labels[2];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6 mb-6 border-l-4 border-moss-500">
        <h1 className="text-2xl font-light text-zen-900">
          🍃 Daily Check-In
        </h1>
        <p className="text-zen-500 text-sm mt-1">
          {alreadyDone
            ? "You already checked in today — update your entry below."
            : "Track how you're feeling today. This helps your AI coach personalise your plan."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/60 border border-red-200 rounded-zen text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Measurements (optional) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6">
          <h2 className="text-lg font-medium text-zen-900 mb-4">📏 Measurements (optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                step="0.1"
                placeholder="e.g. 80.5"
                className="w-full px-3 py-2 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 bg-white/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">Waist (cm)</label>
              <input
                type="number"
                name="waistCm"
                value={form.waistCm}
                onChange={handleChange}
                step="0.1"
                placeholder="e.g. 85.0"
                className="w-full px-3 py-2 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 bg-white/60"
              />
            </div>
          </div>
        </div>

        {/* How You Feel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6">
          <h2 className="text-lg font-medium text-zen-900 mb-4">🧠 How Are You Feeling?</h2>
          <div className="space-y-5">
            {/* Sleep */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Sleep: <span className="font-semibold text-moss-600">{form.sleepHours} hours</span>
              </label>
              <input
                type="range"
                name="sleepHours"
                min="0"
                max="12"
                step="0.5"
                value={form.sleepHours}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
              <div className="flex justify-between text-xs text-zen-400">
                <span>0h</span><span>6h</span><span>12h</span>
              </div>
            </div>

            {/* Stress */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Stress: <span className="font-semibold text-moss-600">{form.stressLevel}/10</span>
                <span className="text-xs text-zen-400 ml-2">
                  ({sliderLabel(form.stressLevel, ["Low", "Moderate", "High"])})
                </span>
              </label>
              <input
                type="range"
                name="stressLevel"
                min="1"
                max="10"
                value={form.stressLevel}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
            </div>

            {/* Energy */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Energy: <span className="font-semibold text-moss-600">{form.energyLevel}/10</span>
                <span className="text-xs text-zen-400 ml-2">
                  ({sliderLabel(form.energyLevel, ["Low", "Moderate", "High"])})
                </span>
              </label>
              <input
                type="range"
                name="energyLevel"
                min="1"
                max="10"
                value={form.energyLevel}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
            </div>

            {/* Soreness */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Soreness: <span className="font-semibold text-moss-600">{form.sorenessLevel}/10</span>
                <span className="text-xs text-zen-400 ml-2">
                  ({sliderLabel(form.sorenessLevel, ["Minimal", "Moderate", "Intense"])})
                </span>
              </label>
              <input
                type="range"
                name="sorenessLevel"
                min="1"
                max="10"
                value={form.sorenessLevel}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
            </div>

            {/* Bloating */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Bloating: <span className="font-semibold text-moss-600">{form.bloatingLevel}/10</span>
                <span className="text-xs text-zen-400 ml-2">
                  ({sliderLabel(form.bloatingLevel, ["None", "Some", "Significant"])})
                </span>
              </label>
              <input
                type="range"
                name="bloatingLevel"
                min="1"
                max="10"
                value={form.bloatingLevel}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
            </div>
          </div>
        </div>

        {/* Activity & Adherence */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6">
          <h2 className="text-lg font-medium text-zen-900 mb-4">🏃 Activity & Adherence</h2>
          <div className="space-y-5">
            {/* Steps */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">Steps Completed</label>
              <input
                type="number"
                name="stepsCompleted"
                value={form.stepsCompleted}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 8000"
                className="w-full px-3 py-2 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 bg-white/60"
              />
            </div>

            {/* Diet Adherence */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Diet Adherence: <span className="font-semibold text-moss-600">{Math.round(parseFloat(form.dietAdherence) * 100)}%</span>
              </label>
              <input
                type="range"
                name="dietAdherence"
                min="0"
                max="1"
                step="0.05"
                value={form.dietAdherence}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
              <div className="flex justify-between text-xs text-zen-400">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            {/* Workout Adherence */}
            <div>
              <label className="block text-sm font-medium text-zen-700 mb-1">
                Workout Adherence: <span className="font-semibold text-moss-600">{Math.round(parseFloat(form.workoutAdherence) * 100)}%</span>
              </label>
              <input
                type="range"
                name="workoutAdherence"
                min="0"
                max="1"
                step="0.05"
                value={form.workoutAdherence}
                onChange={handleChange}
                className="w-full accent-moss-500"
              />
              <div className="flex justify-between text-xs text-zen-400">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-6">
          <h2 className="text-lg font-medium text-zen-900 mb-4">📝 Notes (optional)</h2>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Anything else? How did you feel about today?"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 bg-white/60"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-moss-500 hover:bg-moss-600 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : alreadyDone
              ? "Update Check-In"
              : "Submit Check-In"}
        </button>
      </form>
    </div>
  );
}
