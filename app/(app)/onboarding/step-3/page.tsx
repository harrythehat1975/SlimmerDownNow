"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    activityLevel: "",
    dietaryStyle: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Frontend guard: redirect if onboarding already completed
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const profile = await res.json();
          if (profile.onboardingCompleted) {
            router.replace("/dashboard");
            return;
          }
        }
      } catch {}
    }
    checkOnboarding();
  }, [router]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          activityLevel: data.activityLevel || "",
          dietaryStyle: data.dietaryStyle || "",
        });
      } catch (err) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

    if (!formData.activityLevel) {
      newErrors.activityLevel = "Please select your activity level";
    }
    if (!formData.dietaryStyle) {
      newErrors.dietaryStyle = "Please select your dietary style";
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
      JSON.stringify({ ...data, ...formData })
    );

    // Navigate to step 4
    router.push("/onboarding/step-4");
  };

  const handlePrevious = () => {
    // Save current state
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({ ...data, ...formData })
    );
    router.push("/onboarding/step-2");
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-earth-900">Lifestyle</h2>
        <p className="text-earth-500 text-sm mt-1">Tell us about your daily activity and sleep habits.</p>
      </div>
      {/* Activity Level */}
      <div>
        <label htmlFor="activityLevel" className="block text-sm font-medium text-earth-700 mb-2">
          Activity Level
        </label>
        <select
          id="activityLevel"
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.activityLevel ? "border-red-400" : "border-sand-300"
          }`}
        >
          <option value="">Select your activity level</option>
          <option value="sedentary">
            Sedentary (Little to no exercise)
          </option>
          <option value="light">
            Light (Exercise 1-3 days/week)
          </option>
          <option value="moderate">
            Moderate (Exercise 3-5 days/week)
          </option>
          <option value="active">
            Active (Exercise 6-7 days/week)
          </option>
          <option value="very_active">
            Very Active (Intense exercise 6-7 days/week)
          </option>
        </select>
        {errors.activityLevel && (
          <p className="text-red-600/80 text-sm mt-1">{errors.activityLevel}</p>
        )}
      </div>

      {/* Dietary Style */}
      <div>
        <label htmlFor="dietaryStyle" className="block text-sm font-medium text-earth-700 mb-2">
          Dietary Style
        </label>
        <select
          id="dietaryStyle"
          name="dietaryStyle"
          value={formData.dietaryStyle}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.dietaryStyle ? "border-red-400" : "border-sand-300"
          }`}
        >
          <option value="">Select your dietary style</option>
          <option value="omnivore">Omnivore (No restrictions)</option>
          <option value="vegetarian">Vegetarian (No meat)</option>
          <option value="pescatarian">Pescatarian (Fish/seafood ok)</option>
        </select>
        {errors.dietaryStyle && (
          <p className="text-red-600/80 text-sm mt-1">{errors.dietaryStyle}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t border-sand-200">
        <button
          type="button"
          onClick={handlePrevious}
          className="flex-1 bg-sand-200 hover:bg-sand-300 text-earth-800 font-medium py-3 rounded-zen transition-all duration-300"
        >
          Previous
        </button>
        <button
          type="submit"
          className="flex-1 bg-sage-800 hover:bg-sage-900 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen"
        >
          Next
        </button>
      </div>
    </form>
  );
}
