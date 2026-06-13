"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/db/auth";
import { isPreLaunchMode } from "@/lib/preLaunch";
import IntakeValueStory from "@/components/intake/IntakeValueStory";

// Sign-up form. Wired to Supabase auth + user/company provisioning via signUp().
// Navigation only happens on a real successful sign-up (when Supabase is
// configured). DEV NOTE: when Supabase isn't configured we show a clear message
// instead of fake-navigating, so we never imply a session that doesn't exist.
export default function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signUp({ email, password, firstName, lastName, companyName });
    setBusy(false);
    if (res.ok) {
      router.push("/my-business");
      router.refresh();
      return;
    }
    if (!res.configured) {
      setError("Supabase isn’t configured, so account creation is disabled in this demo build. Add your keys to .env.local to enable real auth.");
      return;
    }
    setError(res.error ?? "Unable to create account.");
  }

  const preLaunch = isPreLaunchMode();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 sm:py-16 bg-gray-50 gap-6">
      {preLaunch && (
        <div className="w-full max-w-md animate-fade-in">
          <IntakeValueStory variant="compact" />
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href={preLaunch ? "/intake" : "/"} className="text-2xl font-bold text-blue-700 tracking-tight">
            Cap<span className="text-gray-900">Maxx</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-700 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
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
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Business Name"
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
              placeholder="Create a password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition-colors text-sm disabled:opacity-60"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
