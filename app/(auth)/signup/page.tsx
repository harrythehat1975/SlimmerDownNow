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

      router.push("/login?signup=success");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen zen-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md zen-card p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-light text-earth-900 mt-2">Create Your Account</h1>
          <p className="text-earth-500 text-sm mt-1">
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
            <label htmlFor="email" className="zen-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="zen-input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="zen-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="zen-input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="zen-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="zen-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="zen-btn w-full disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Begin Journey"}
          </button>
        </form>

        <p className="text-center text-sm text-earth-500 mt-6">
          Already on the path?{" "}
          <Link href="/login" className="text-sage-700 hover:text-sage-900 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
