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

      // Redirect to onboarding or dashboard
      router.push("/onboarding");
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
          <h1 className="text-2xl font-light text-zen-900 mt-2">Welcome Back</h1>
          <p className="text-zen-500 text-sm mt-1">
            Continue your mindful journey
          </p>
        </div>

        {signupSuccess && (
          <div className="mb-4 p-3 bg-moss-50 border border-moss-200 rounded-zen text-moss-700 text-sm">
            ✓ Account created successfully! Please sign in.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-zen text-red-700/80 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zen-700 mb-1">
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
              className="w-full px-4 py-2.5 border border-stone-300 rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 disabled:bg-stone-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zen-700 mb-1">
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
              className="w-full px-4 py-2.5 border border-stone-300 rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 disabled:bg-stone-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-moss-500 hover:bg-moss-600 text-white font-medium py-2.5 rounded-zen transition-all duration-300 disabled:opacity-50 shadow-zen"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-zen-500 text-sm mt-6">
          New to the journey?{" "}
          <Link href="/signup" className="text-moss-600 hover:text-moss-700 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
