"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep2() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    heightCm: "",
    weightKg: "",
    waistCm: "",
    ageYears: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          heightCm: data.heightCm || "",
          weightKg: data.weightKg || "",
          waistCm: data.waistCm || "",
          ageYears: data.ageYears || "",
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

    const height = parseFloat(formData.heightCm);
    if (!formData.heightCm || isNaN(height) || height < 100 || height > 250) {
      newErrors.heightCm = "Height must be between 100-250 cm";
    }

    const weight = parseFloat(formData.weightKg);
    if (!formData.weightKg || isNaN(weight) || weight < 20 || weight > 300) {
      newErrors.weightKg = "Weight must be between 20-300 kg";
    }

    const waist = parseFloat(formData.waistCm);
    if (!formData.waistCm || isNaN(waist) || waist < 40) {
      newErrors.waistCm = "Waist circumference must be at least 40 cm";
    }

    const age = parseInt(formData.ageYears);
    if (!formData.ageYears || isNaN(age) || age < 18 || age > 120) {
      newErrors.ageYears = "Age must be between 18-120";
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
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        waistCm: parseFloat(formData.waistCm),
        ageYears: parseInt(formData.ageYears),
      })
    );

    // Navigate to step 3
    router.push("/onboarding/step-3");
  };

  const handlePrevious = () => {
    // Save current state
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : "",
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : "",
        waistCm: formData.waistCm ? parseFloat(formData.waistCm) : "",
        ageYears: formData.ageYears ? parseInt(formData.ageYears) : "",
      })
    );
    router.push("/onboarding/step-1");
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {/* Height */}
      <div>
        <label htmlFor="heightCm" className="block text-sm font-medium text-gray-900 mb-2">
          Height (cm)
        </label>
        <input
          type="number"
          id="heightCm"
          name="heightCm"
          value={formData.heightCm}
          onChange={handleChange}
          placeholder="170"
          min="100"
          max="250"
          step="0.1"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.heightCm ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.heightCm && (
          <p className="text-red-600 text-sm mt-1">{errors.heightCm}</p>
        )}
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weightKg" className="block text-sm font-medium text-gray-900 mb-2">
          Weight (kg)
        </label>
        <input
          type="number"
          id="weightKg"
          name="weightKg"
          value={formData.weightKg}
          onChange={handleChange}
          placeholder="75"
          min="20"
          max="300"
          step="0.1"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.weightKg ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.weightKg && (
          <p className="text-red-600 text-sm mt-1">{errors.weightKg}</p>
        )}
      </div>

      {/* Waist Circumference */}
      <div>
        <label htmlFor="waistCm" className="block text-sm font-medium text-gray-900 mb-2">
          Waist Circumference (cm)
        </label>
        <input
          type="number"
          id="waistCm"
          name="waistCm"
          value={formData.waistCm}
          onChange={handleChange}
          placeholder="85"
          min="40"
          step="0.1"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.waistCm ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.waistCm && (
          <p className="text-red-600 text-sm mt-1">{errors.waistCm}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label htmlFor="ageYears" className="block text-sm font-medium text-gray-900 mb-2">
          Age (years)
        </label>
        <input
          type="number"
          id="ageYears"
          name="ageYears"
          value={formData.ageYears}
          onChange={handleChange}
          placeholder="35"
          min="18"
          max="120"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition ${
            errors.ageYears ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.ageYears && (
          <p className="text-red-600 text-sm mt-1">{errors.ageYears}</p>
        )}
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
