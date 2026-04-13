"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1
    router.push("/onboarding/step-1");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zen-50 via-stone-50 to-moss-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-moss-500"></div>
        <p className="mt-4 text-zen-500">Redirecting to onboarding...</p>
      </div>
    </div>
  );
}
