"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
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
          <h1 className="text-2xl font-light text-earth-900 mt-2">Welcome Back</h1>
          <p className="text-earth-500 text-sm mt-1">
            Continue your mindful journey
          </p>
        </div>

        {signupSuccess && (
          <div className="mb-4 p-3 bg-sage-50 border border-sage-200 rounded-zen text-sage-800 text-sm">
            Account created successfully. Please sign in.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-zen text-red-700/80 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="zen-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="zen-input disabled:bg-sand-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="zen-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="zen-input disabled:bg-sand-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="zen-btn w-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-earth-500 text-sm mt-6">
          New to the journey?{" "}
          <Link href="/signup" className="text-sage-700 hover:text-sage-900 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
