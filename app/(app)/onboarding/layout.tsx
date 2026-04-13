"use client";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen zen-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="zen-card border-t-4 border-sage-500 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
