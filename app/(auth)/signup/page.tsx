"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Client-side validation
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const validation = signupSchema.safeParse({ email, password, confirmPassword });
      if (!validation.success) {
        const errorMessage =
          validation.error.errors[0]?.message || "Invalid input";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Call signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Redirect to login
      router.push("/login?signup=success");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-50 via-stone-50 to-moss-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-zen shadow-zen-md p-8 border border-stone-100">
        <div className="text-center mb-6">
          <span className="text-3xl">🌿</span>
          <h1 className="text-2xl font-light text-zen-900 mt-2">Create Your Account</h1>
          <p className="text-zen-500 text-sm mt-1">
            Begin your mindful waist loss journey
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-zen text-red-700/80 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zen-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zen-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zen-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-zen focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-moss-500 text-white rounded-zen font-medium hover:bg-moss-600 transition-all duration-300 disabled:opacity-50 shadow-zen"
          >
            {loading ? "Creating account..." : "Begin Journey"}
          </button>
        </form>

        <p className="text-center text-sm text-zen-500 mt-6">
          Already on the path?{" "}
          <Link href="/login" className="text-moss-600 hover:text-moss-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
