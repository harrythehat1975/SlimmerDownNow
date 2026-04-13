"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UnitSystem = "metric" | "us";

// Conversion helpers
const cmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

const feetInchesToCm = (feet: number, inches: number) =>
  (feet * 12 + inches) * 2.54;

const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const lbsToKg = (lbs: number) => lbs / 2.20462;

const cmToInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
const inchesToCm = (inches: number) => inches * 2.54;

export default function OnboardingStep2() {
  const router = useRouter();
  const [unit, setUnit] = useState<UnitSystem>("us");
  const [formData, setFormData] = useState({
    heightCm: "",
    weightKg: "",
    waistCm: "",
    ageYears: "",
  });
  // US-specific fields for height (feet + inches)
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [waistIn, setWaistIn] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const savedUnit: UnitSystem = data.unitSystem || "us";
        setUnit(savedUnit);

        setFormData({
          heightCm: data.heightCm || "",
          weightKg: data.weightKg || "",
          waistCm: data.waistCm || "",
          ageYears: data.ageYears || "",
        });

        // Populate US fields from metric values
        if (data.heightCm) {
          const { feet, inches } = cmToFeetInches(Number(data.heightCm));
          setHeightFeet(String(feet));
          setHeightInches(String(inches));
        }
        if (data.weightKg) {
          setWeightLbs(String(kgToLbs(Number(data.weightKg))));
        }
        if (data.waistCm) {
          setWaistIn(String(cmToInches(Number(data.waistCm))));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleUnitSwitch = (newUnit: UnitSystem) => {
    setUnit(newUnit);
    setErrors({});

    if (newUnit === "us") {
      // Convert current metric values to US for display
      if (formData.heightCm) {
        const { feet, inches } = cmToFeetInches(Number(formData.heightCm));
        setHeightFeet(String(feet));
        setHeightInches(String(inches));
      }
      if (formData.weightKg) setWeightLbs(String(kgToLbs(Number(formData.weightKg))));
      if (formData.waistCm) setWaistIn(String(cmToInches(Number(formData.waistCm))));
    } else {
      // Convert current US values to metric for display
      if (heightFeet || heightInches) {
        const cm = feetInchesToCm(Number(heightFeet) || 0, Number(heightInches) || 0);
        setFormData((prev) => ({ ...prev, heightCm: String(Math.round(cm * 10) / 10) }));
      }
      if (weightLbs) {
        const kg = lbsToKg(Number(weightLbs));
        setFormData((prev) => ({ ...prev, weightKg: String(Math.round(kg * 10) / 10) }));
      }
      if (waistIn) {
        const cm = inchesToCm(Number(waistIn));
        setFormData((prev) => ({ ...prev, waistCm: String(Math.round(cm * 10) / 10) }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (unit === "metric") {
      const height = parseFloat(formData.heightCm);
      if (!formData.heightCm || isNaN(height) || height < 100 || height > 250) {
        newErrors.heightCm = "Height must be between 100–250 cm";
      }
      const weight = parseFloat(formData.weightKg);
      if (!formData.weightKg || isNaN(weight) || weight < 20 || weight > 300) {
        newErrors.weightKg = "Weight must be between 20–300 kg";
      }
      const waist = parseFloat(formData.waistCm);
      if (!formData.waistCm || isNaN(waist) || waist < 40) {
        newErrors.waistCm = "Waist must be at least 40 cm";
      }
    } else {
      const ft = parseInt(heightFeet);
      const inches = parseInt(heightInches);
      if (!heightFeet || isNaN(ft) || ft < 3 || ft > 8) {
        newErrors.heightFeet = "Feet must be between 3–8";
      }
      if (heightInches && (isNaN(inches) || inches < 0 || inches > 11)) {
        newErrors.heightInches = "Inches must be 0–11";
      }
      const lbs = parseFloat(weightLbs);
      if (!weightLbs || isNaN(lbs) || lbs < 44 || lbs > 660) {
        newErrors.weightLbs = "Weight must be between 44–660 lbs";
      }
      const waist = parseFloat(waistIn);
      if (!waistIn || isNaN(waist) || waist < 16) {
        newErrors.waistIn = "Waist must be at least 16 inches";
      }
    }

    const age = parseInt(formData.ageYears);
    if (!formData.ageYears || isNaN(age) || age < 18 || age > 120) {
      newErrors.ageYears = "Age must be between 18–120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Always store in metric
    let heightCm: number, weightKg: number, waistCm: number;

    if (unit === "us") {
      heightCm = Math.round(feetInchesToCm(Number(heightFeet) || 0, Number(heightInches) || 0) * 10) / 10;
      weightKg = Math.round(lbsToKg(Number(weightLbs)) * 10) / 10;
      waistCm = Math.round(inchesToCm(Number(waistIn)) * 10) / 10;
    } else {
      heightCm = parseFloat(formData.heightCm);
      weightKg = parseFloat(formData.weightKg);
      waistCm = parseFloat(formData.waistCm);
    }

    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        heightCm,
        weightKg,
        waistCm,
        ageYears: parseInt(formData.ageYears),
        unitSystem: unit,
      })
    );

    router.push("/onboarding/step-3");
  };

  const handlePrevious = () => {
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
        unitSystem: unit,
      })
    );
    router.push("/onboarding/step-1");
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-earth-900">Measurements</h2>
        <p className="text-earth-500 text-sm mt-1">We need a few body measurements to build your plan.</p>
      </div>

      {/* Unit Toggle */}
      <div className="flex rounded-zen overflow-hidden border border-sand-300">
        <button
          type="button"
          onClick={() => handleUnitSwitch("us")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            unit === "us"
              ? "bg-sage-800 text-white"
              : "bg-sand-50 text-earth-600 hover:bg-sand-100"
          }`}
        >
          US (ft, lbs, in)
        </button>
        <button
          type="button"
          onClick={() => handleUnitSwitch("metric")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            unit === "metric"
              ? "bg-sage-800 text-white"
              : "bg-sand-50 text-earth-600 hover:bg-sand-100"
          }`}
        >
          Metric (cm, kg)
        </button>
      </div>

      {/* Height */}
      {unit === "metric" ? (
        <div>
          <label htmlFor="heightCm" className="block text-sm font-medium text-earth-700 mb-2">
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
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
              errors.heightCm ? "border-red-400" : "border-sand-300"
            }`}
          />
          {errors.heightCm && (
            <p className="text-red-600/80 text-sm mt-1">{errors.heightCm}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-2">
            Height
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="number"
                  value={heightFeet}
                  onChange={(e) => {
                    setHeightFeet(e.target.value);
                    if (errors.heightFeet) setErrors((prev) => { const { heightFeet: _, ...rest } = prev; return rest; });
                  }}
                  placeholder="5"
                  min="3"
                  max="8"
                  className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 pr-10 ${
                    errors.heightFeet ? "border-red-400" : "border-sand-300"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">ft</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="number"
                  value={heightInches}
                  onChange={(e) => {
                    setHeightInches(e.target.value);
                    if (errors.heightInches) setErrors((prev) => { const { heightInches: _, ...rest } = prev; return rest; });
                  }}
                  placeholder="8"
                  min="0"
                  max="11"
                  className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 pr-10 ${
                    errors.heightInches ? "border-red-400" : "border-sand-300"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">in</span>
              </div>
            </div>
          </div>
          {(errors.heightFeet || errors.heightInches) && (
            <p className="text-red-600/80 text-sm mt-1">{errors.heightFeet || errors.heightInches}</p>
          )}
        </div>
      )}

      {/* Weight */}
      {unit === "metric" ? (
        <div>
          <label htmlFor="weightKg" className="block text-sm font-medium text-earth-700 mb-2">
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
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
              errors.weightKg ? "border-red-400" : "border-sand-300"
            }`}
          />
          {errors.weightKg && (
            <p className="text-red-600/80 text-sm mt-1">{errors.weightKg}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="weightLbs" className="block text-sm font-medium text-earth-700 mb-2">
            Weight (lbs)
          </label>
          <input
            type="number"
            id="weightLbs"
            value={weightLbs}
            onChange={(e) => {
              setWeightLbs(e.target.value);
              if (errors.weightLbs) setErrors((prev) => { const { weightLbs: _, ...rest } = prev; return rest; });
            }}
            placeholder="165"
            min="44"
            max="660"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
              errors.weightLbs ? "border-red-400" : "border-sand-300"
            }`}
          />
          {errors.weightLbs && (
            <p className="text-red-600/80 text-sm mt-1">{errors.weightLbs}</p>
          )}
        </div>
      )}

      {/* Waist Circumference */}
      {unit === "metric" ? (
        <div>
          <label htmlFor="waistCm" className="block text-sm font-medium text-earth-700 mb-2">
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
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
              errors.waistCm ? "border-red-400" : "border-sand-300"
            }`}
          />
          {errors.waistCm && (
            <p className="text-red-600/80 text-sm mt-1">{errors.waistCm}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="waistIn" className="block text-sm font-medium text-earth-700 mb-2">
            Waist Circumference (inches)
          </label>
          <input
            type="number"
            id="waistIn"
            value={waistIn}
            onChange={(e) => {
              setWaistIn(e.target.value);
              if (errors.waistIn) setErrors((prev) => { const { waistIn: _, ...rest } = prev; return rest; });
            }}
            placeholder="33"
            min="16"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
              errors.waistIn ? "border-red-400" : "border-sand-300"
            }`}
          />
          {errors.waistIn && (
            <p className="text-red-600/80 text-sm mt-1">{errors.waistIn}</p>
          )}
        </div>
      )}

      {/* Age */}
      <div>
        <label htmlFor="ageYears" className="block text-sm font-medium text-earth-700 mb-2">
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
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all duration-200 bg-sand-50 ${
            errors.ageYears ? "border-red-400" : "border-sand-300"
          }`}
        />
        {errors.ageYears && (
          <p className="text-red-600/80 text-sm mt-1">{errors.ageYears}</p>
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
