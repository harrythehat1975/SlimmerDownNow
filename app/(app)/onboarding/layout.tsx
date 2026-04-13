"use client";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-50 via-stone-50 to-moss-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen-md p-8 border-t-4 border-moss-400">
          {children}
        </div>
      </div>
    </div>
  );
}
