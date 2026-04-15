"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sex: "",
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
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          sex: data.sex || "",
        });
      } catch (err) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.sex) {
      newErrors.sex = "Please select your sex";
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

    // Navigate to step 2
    router.push("/onboarding/step-2");
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-earth-900">Personal Info</h2>
        <p className="text-earth-500 text-sm mt-1">Let&apos;s start with some basics about you.</p>
      </div>
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-earth-700 mb-2">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.firstName ? "border-red-400" : "border-sand-300"
          }`}
        />
        {errors.firstName && (
          <p className="text-red-600/80 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-earth-700 mb-2">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Doe"
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.lastName ? "border-red-400" : "border-sand-300"
          }`}
        />
        {errors.lastName && (
          <p className="text-red-600/80 text-sm mt-1">{errors.lastName}</p>
        )}
      </div>

      {/* Sex */}
      <div>
        <label htmlFor="sex" className="block text-sm font-medium text-earth-700 mb-2">
          Sex
        </label>
        <select
          id="sex"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.sex ? "border-red-400" : "border-sand-300"
          }`}
        >
          <option value="">Select your sex</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.sex && (
          <p className="text-red-600/80 text-sm mt-1">{errors.sex}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t border-sand-200">
        <button
          type="submit"
          className="flex-1 bg-sage-800 hover:bg-sage-900 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
