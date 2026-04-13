"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center zen-bg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
          <p className="mt-4 text-earth-500 font-light">Finding your balance...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen zen-bg">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-sand-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-sage-700">S</span>
              <h1 className="text-xl font-light tracking-tight text-earth-800">
                Slimmer Down Now
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-earth-600 hover:text-sage-700 font-medium text-sm transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/coach"
                className="text-earth-600 hover:text-sage-700 font-medium text-sm transition-all duration-200"
              >
                Coach
              </Link>
              <Link
                href="/checkin"
                className="text-earth-600 hover:text-sage-700 font-medium text-sm transition-all duration-200"
              >
                Check-In
              </Link>
              <Link
                href="/settings"
                className="text-earth-600 hover:text-sage-700 font-medium text-sm transition-all duration-200"
              >
                Settings
              </Link>
              <div className="flex items-center gap-3 pl-6 border-l border-sand-300">
                <span className="text-xs text-earth-500">{session.user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-sand-200 hover:bg-sand-300 text-earth-700 px-3 py-1.5 rounded-zen text-sm font-medium transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
