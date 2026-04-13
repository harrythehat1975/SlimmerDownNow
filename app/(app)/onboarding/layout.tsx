"use client";

import { usePathname } from "next/navigation";

const steps = [
  { number: 1, title: "Personal Info", path: "/onboarding/step-1" },
  { number: 2, title: "Measurements", path: "/onboarding/step-2" },
  { number: 3, title: "Lifestyle", path: "/onboarding/step-3" },
  { number: 4, title: "Goals", path: "/onboarding/step-4" },
  { number: 5, title: "Preferences", path: "/onboarding/step-5" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = steps.findIndex((s) => s.path === pathname) + 1 || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    currentStep >= step.number
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-8 mx-2 transition-all ${
                      currentStep > step.number ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1]?.title}
            </h1>
            <p className="text-gray-600">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-indigo-600">
          {children}
        </div>
      </div>
    </div>
  );
}
