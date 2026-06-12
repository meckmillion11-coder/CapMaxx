"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/db/auth";

// Sign-in form. Persistence is wired to Supabase auth via signIn(). Navigation
// only happens on a real successful sign-in (when Supabase is configured).
// DEV NOTE: when Supabase isn't configured the helper returns
// { configured:false }; we surface a clear message instead of fake-navigating,
// so the logged-in state never lies about a session that doesn't exist.
export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (res.ok) {
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirect || "/my-business");
      router.refresh();
      return;
    }
    if (!res.configured) {
      setError("Supabase isn’t configured, so sign-in is disabled in this demo build. Add your keys to .env.local to enable real auth.");
      return;
    }
    setError(res.error ?? "Unable to sign in.");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-700 tracking-tight">
            Cap<span className="text-gray-900">Maxx</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-700 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-blue-700" />
              Remember me
            </label>
            <a href="#" className="text-blue-700 hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition-colors text-sm disabled:opacity-60"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
