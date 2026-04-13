"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep4() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    waistLossGoalCm: "",
    timelineDays: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          waistLossGoalCm: data.waistLossGoalCm || "",
          timelineDays: data.timelineDays || "",
        });
      } catch (err) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const goal = parseFloat(formData.waistLossGoalCm);
    if (!formData.waistLossGoalCm || isNaN(goal) || goal <= 0) {
      newErrors.waistLossGoalCm = "Waist loss goal must be greater than 0 cm";
    }

    const timeline = parseInt(formData.timelineDays);
    if (!formData.timelineDays || isNaN(timeline) || timeline < 30) {
      newErrors.timelineDays = "Timeline must be at least 30 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Save to localStorage
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        waistLossGoalCm: parseFloat(formData.waistLossGoalCm),
        timelineDays: parseInt(formData.timelineDays),
      })
    );

    // Navigate to step 5
    router.push("/onboarding/step-5");
  };

  const handlePrevious = () => {
    // Save current state
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        waistLossGoalCm: formData.waistLossGoalCm ? parseFloat(formData.waistLossGoalCm) : "",
        timelineDays: formData.timelineDays ? parseInt(formData.timelineDays) : "",
      })
    );
    router.push("/onboarding/step-3");
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {/* Waist Loss Goal */}
      <div>
        <label htmlFor="waistLossGoalCm" className="block text-sm font-medium text-gray-900 mb-2">
          Target Waist Loss (cm)
        </label>
        <input
          type="number"
          id="waistLossGoalCm"
          name="waistLossGoalCm"
          value={formData.waistLossGoalCm}
          onChange={handleChange}
          placeholder="10"
          min="0"
          step="0.1"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.waistLossGoalCm ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.waistLossGoalCm && (
          <p className="text-red-600 text-sm mt-1">{errors.waistLossGoalCm}</p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="timelineDays" className="block text-sm font-medium text-gray-900 mb-2">
          Timeline (days)
        </label>
        <input
          type="number"
          id="timelineDays"
          name="timelineDays"
          value={formData.timelineDays}
          onChange={handleChange}
          placeholder="90"
          min="30"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.timelineDays ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.timelineDays && (
          <p className="text-red-600 text-sm mt-1">{errors.timelineDays}</p>
        )}
        <p className="text-gray-600 text-sm mt-2">
          This is approximately{" "}
          {formData.timelineDays
            ? (parseInt(formData.timelineDays) / 7).toFixed(1)
            : "0"}{" "}
          weeks
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={handlePrevious}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
        >
          Previous
        </button>
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Next
        </button>
      </div>
    </form>
  );
}
