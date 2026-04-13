"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep5() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    preferredCheckInTime: "08:00",
    enableNotifications: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          preferredCheckInTime: data.preferredCheckInTime || "08:00",
          enableNotifications:
            data.enableNotifications !== undefined ? data.enableNotifications : true,
        });
      } catch (err) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

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

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.preferredCheckInTime)) {
      newErrors.preferredCheckInTime = "Please enter a valid time (HH:MM)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // Get all saved data from localStorage
      const saved = localStorage.getItem("onboarding");
      const data = saved ? JSON.parse(saved) : {};

      // Combine all form data
      const fullData = {
        ...data,
        preferredCheckInTime: formData.preferredCheckInTime,
        enableNotifications: formData.enableNotifications,
      };

      // Submit to API
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete onboarding");
      }

      // Clear localStorage and redirect to dashboard
      localStorage.removeItem("onboarding");
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    // Save current state
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        preferredCheckInTime: formData.preferredCheckInTime,
        enableNotifications: formData.enableNotifications,
      })
    );
    router.push("/onboarding/step-4");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-zen-900">Preferences</h2>
        <p className="text-zen-500 text-sm mt-1">Almost done — customize your experience.</p>
      </div>
      {submitError && (
        <div className="bg-red-50/60 border border-red-200 text-red-700 px-4 py-3 rounded-zen">
          {submitError}
        </div>
      )}

      {/* Preferred Check-in Time */}
      <div>
        <label htmlFor="preferredCheckInTime" className="block text-sm font-medium text-zen-700 mb-2">
          Preferred Daily Check-in Time
        </label>
        <input
          type="time"
          id="preferredCheckInTime"
          name="preferredCheckInTime"
          value={formData.preferredCheckInTime}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 ${
            errors.preferredCheckInTime ? "border-red-400" : "border-stone-300"
          }`}
        />
        {errors.preferredCheckInTime && (
          <p className="text-red-600/80 text-sm mt-1">
            {errors.preferredCheckInTime}
          </p>
        )}
        <p className="text-zen-500 text-sm mt-2">
          We&apos;ll send you reminders at this time each day
        </p>
      </div>

      {/* Enable Notifications */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enableNotifications"
          name="enableNotifications"
          checked={formData.enableNotifications}
          onChange={handleChange}
          className="w-5 h-5 rounded border-stone-300 text-moss-500 focus:ring-moss-400 cursor-pointer"
        />
        <label htmlFor="enableNotifications" className="text-sm font-medium text-zen-700 cursor-pointer">
          Enable daily check-in notifications and motivational tips
        </label>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t border-stone-200">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={loading}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-zen-800 font-medium py-3 rounded-zen transition-all duration-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-moss-500 hover:bg-moss-600 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen disabled:opacity-50"
        >
          {loading ? "Completing..." : "Complete Onboarding"}
        </button>
      </div>
    </form>
  );
}
