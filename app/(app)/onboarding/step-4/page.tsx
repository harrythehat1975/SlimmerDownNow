"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UnitSystem = "metric" | "us";

const cmToInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
const inchesToCm = (inches: number) => inches * 2.54;

export default function OnboardingStep4() {
  const router = useRouter();
  const [unit, setUnit] = useState<UnitSystem>("us");
  const [currentWaistCm, setCurrentWaistCm] = useState<number>(0);
  const [targetWaistCm, setTargetWaistCm] = useState("");
  const [targetWaistIn, setTargetWaistIn] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const savedUnit: UnitSystem = data.unitSystem || "us";
        setUnit(savedUnit);

        // Get the current waist from step 2
        if (data.waistCm) {
          setCurrentWaistCm(Number(data.waistCm));
        }

        // Load previously saved target (stored as waistLossGoalCm, compute target from it)
        if (data.targetWaistCm) {
          setTargetWaistCm(String(data.targetWaistCm));
          setTargetWaistIn(String(cmToInches(Number(data.targetWaistCm))));
        } else if (data.waistLossGoalCm && data.waistCm) {
          // Backward compat: convert old waistLossGoalCm to targetWaistCm
          const target = Number(data.waistCm) - Number(data.waistLossGoalCm);
          setTargetWaistCm(String(Math.round(target * 10) / 10));
          setTargetWaistIn(String(cmToInches(target)));
        }

        if (data.timelineDays) {
          setTimelineDays(String(data.timelineDays));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleUnitSwitch = (newUnit: UnitSystem) => {
    setUnit(newUnit);
    setErrors({});
    if (newUnit === "us" && targetWaistCm) {
      setTargetWaistIn(String(cmToInches(Number(targetWaistCm))));
    } else if (newUnit === "metric" && targetWaistIn) {
      const cm = Math.round(inchesToCm(Number(targetWaistIn)) * 10) / 10;
      setTargetWaistCm(String(cm));
    }
  };

  // Compute the loss to display
  const computedLoss = () => {
    if (unit === "metric") {
      const target = parseFloat(targetWaistCm);
      if (!isNaN(target) && currentWaistCm > 0) {
        const loss = Math.round((currentWaistCm - target) * 10) / 10;
        return { value: loss, label: `${loss} cm` };
      }
    } else {
      const target = parseFloat(targetWaistIn);
      const currentIn = cmToInches(currentWaistCm);
      if (!isNaN(target) && currentIn > 0) {
        const loss = Math.round((currentIn - target) * 10) / 10;
        return { value: loss, label: `${loss} in` };
      }
    }
    return null;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (unit === "metric") {
      const target = parseFloat(targetWaistCm);
      if (!targetWaistCm || isNaN(target) || target <= 0) {
        newErrors.targetWaist = "Please enter a valid target waist size";
      } else if (currentWaistCm > 0 && target >= currentWaistCm) {
        newErrors.targetWaist = `Target must be less than your current waist (${currentWaistCm} cm)`;
      }
    } else {
      const target = parseFloat(targetWaistIn);
      const currentIn = cmToInches(currentWaistCm);
      if (!targetWaistIn || isNaN(target) || target <= 0) {
        newErrors.targetWaist = "Please enter a valid target waist size";
      } else if (currentWaistCm > 0 && target >= currentIn) {
        newErrors.targetWaist = `Target must be less than your current waist (${currentIn} in)`;
      }
    }

    const timeline = parseInt(timelineDays);
    if (!timelineDays || isNaN(timeline) || timeline < 30) {
      newErrors.timelineDays = "Timeline must be at least 30 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Compute target in cm and the loss in cm
    let targetCm: number;
    if (unit === "us") {
      targetCm = Math.round(inchesToCm(Number(targetWaistIn)) * 10) / 10;
    } else {
      targetCm = parseFloat(targetWaistCm);
    }
    const waistLossGoalCm = Math.round((currentWaistCm - targetCm) * 10) / 10;

    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};
    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        targetWaistCm: targetCm,
        waistLossGoalCm,
        timelineDays: parseInt(timelineDays),
        unitSystem: unit,
      })
    );

    router.push("/onboarding/step-5");
  };

  const handlePrevious = () => {
    const existing = localStorage.getItem("onboarding");
    const data = existing ? JSON.parse(existing) : {};

    let targetCm: number | string = "";
    if (unit === "us" && targetWaistIn) {
      targetCm = Math.round(inchesToCm(Number(targetWaistIn)) * 10) / 10;
    } else if (targetWaistCm) {
      targetCm = parseFloat(targetWaistCm);
    }

    localStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...data,
        targetWaistCm: targetCm,
        waistLossGoalCm: targetCm && currentWaistCm ? Math.round((currentWaistCm - Number(targetCm)) * 10) / 10 : "",
        timelineDays: timelineDays ? parseInt(timelineDays) : "",
        unitSystem: unit,
      })
    );
    router.push("/onboarding/step-3");
  };

  const loss = computedLoss();
  const currentDisplay = unit === "metric"
    ? `${currentWaistCm} cm`
    : `${cmToInches(currentWaistCm)} in`;

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-zen-900">Goals</h2>
        <p className="text-zen-500 text-sm mt-1">Set your target waist size and timeline.</p>
      </div>

      {/* Unit Toggle */}
      <div className="flex rounded-zen overflow-hidden border border-stone-300">
        <button
          type="button"
          onClick={() => handleUnitSwitch("us")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            unit === "us"
              ? "bg-moss-500 text-white"
              : "bg-white/60 text-zen-600 hover:bg-stone-50"
          }`}
        >
          🇺🇸 US (inches)
        </button>
        <button
          type="button"
          onClick={() => handleUnitSwitch("metric")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            unit === "metric"
              ? "bg-moss-500 text-white"
              : "bg-white/60 text-zen-600 hover:bg-stone-50"
          }`}
        >
          🌍 Metric (cm)
        </button>
      </div>

      {/* Current Waist Display */}
      {currentWaistCm > 0 && (
        <div className="bg-stone-50/80 rounded-zen p-4 border border-stone-200">
          <p className="text-sm text-zen-500">Your current waist size</p>
          <p className="text-2xl font-light text-zen-900">{currentDisplay}</p>
        </div>
      )}

      {/* Target Waist Size */}
      {unit === "metric" ? (
        <div>
          <label htmlFor="targetWaistCm" className="block text-sm font-medium text-zen-700 mb-2">
            Target Waist Size (cm)
          </label>
          <input
            type="number"
            id="targetWaistCm"
            value={targetWaistCm}
            onChange={(e) => {
              setTargetWaistCm(e.target.value);
              if (errors.targetWaist) setErrors((prev) => { const { targetWaist: _, ...rest } = prev; return rest; });
            }}
            placeholder={currentWaistCm > 0 ? String(Math.round((currentWaistCm - 10) * 10) / 10) : "75"}
            min="1"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 ${
              errors.targetWaist ? "border-red-400" : "border-stone-300"
            }`}
          />
          {errors.targetWaist && (
            <p className="text-red-600/80 text-sm mt-1">{errors.targetWaist}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="targetWaistIn" className="block text-sm font-medium text-zen-700 mb-2">
            Target Waist Size (inches)
          </label>
          <input
            type="number"
            id="targetWaistIn"
            value={targetWaistIn}
            onChange={(e) => {
              setTargetWaistIn(e.target.value);
              if (errors.targetWaist) setErrors((prev) => { const { targetWaist: _, ...rest } = prev; return rest; });
            }}
            placeholder={currentWaistCm > 0 ? String(cmToInches(currentWaistCm) - 4) : "30"}
            min="1"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 ${
              errors.targetWaist ? "border-red-400" : "border-stone-300"
            }`}
          />
          {errors.targetWaist && (
            <p className="text-red-600/80 text-sm mt-1">{errors.targetWaist}</p>
          )}
        </div>
      )}

      {/* Computed Loss Display */}
      {loss && loss.value > 0 && (
        <div className="bg-moss-50/60 border border-moss-200 rounded-zen p-4">
          <p className="text-sm text-moss-700">You&apos;ll lose</p>
          <p className="text-2xl font-bold text-moss-800">{loss.label}</p>
          <p className="text-xs text-moss-600 mt-1">from your waist</p>
        </div>
      )}

      {/* Timeline */}
      <div>
        <label htmlFor="timelineDays" className="block text-sm font-medium text-zen-700 mb-2">
          Timeline (days)
        </label>
        <input
          type="number"
          id="timelineDays"
          name="timelineDays"
          value={timelineDays}
          onChange={(e) => {
            setTimelineDays(e.target.value);
            if (errors.timelineDays) setErrors((prev) => { const { timelineDays: _, ...rest } = prev; return rest; });
          }}
          placeholder="90"
          min="30"
          className={`w-full px-4 py-3 border rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 ${
            errors.timelineDays ? "border-red-400" : "border-stone-300"
          }`}
        />
        {errors.timelineDays && (
          <p className="text-red-600/80 text-sm mt-1">{errors.timelineDays}</p>
        )}
        <p className="text-zen-500 text-sm mt-2">
          This is approximately{" "}
          {timelineDays
            ? (parseInt(timelineDays) / 7).toFixed(1)
            : "0"}{" "}
          weeks
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t border-stone-200">
        <button
          type="button"
          onClick={handlePrevious}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-zen-800 font-medium py-3 rounded-zen transition-all duration-300"
        >
          Previous
        </button>
        <button
          type="submit"
          className="flex-1 bg-moss-500 hover:bg-moss-600 text-white font-medium py-3 rounded-zen transition-all duration-300 shadow-zen"
        >
          Next
        </button>
      </div>
    </form>
  );
}
