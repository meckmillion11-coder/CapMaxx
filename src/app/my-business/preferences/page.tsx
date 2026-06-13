"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { savePreferences } from "@/lib/db/profiles";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveCurrentUserId } from "@/lib/db/client-helpers";

export default function BusinessPreferencesPage() {
  const [targetIndustries, setTargetIndustries] = useState("");
  const [excludedCompanies, setExcludedCompanies] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) setLoaded(true);
        return;
      }
      const userId = await resolveCurrentUserId(supabase);
      if (!userId) {
        if (active) setLoaded(true);
        return;
      }
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();
      if (!company?.id) {
        if (active) setLoaded(true);
        return;
      }
      const { data: profile } = await supabase
        .from("company_profiles")
        .select("preferences")
        .eq("company_id", company.id)
        .maybeSingle();
      const prefs = (profile?.preferences ?? {}) as Record<string, string>;
      if (active) {
        setTargetIndustries(prefs["Target Industries"] ?? "");
        setExcludedCompanies(prefs["Excluded Companies"] ?? "");
        setLoaded(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const prefs: Record<string, string> = {};
    fd.forEach((value, key) => {
      prefs[key] = String(value);
    });
    void savePreferences(prefs);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="mb-4">
        <Link href="/my-business" className="text-[12px] text-blue-700 hover:underline mb-1 inline-block">
          ← Back to dashboard
        </Link>
        <h1 className="text-base font-bold text-gray-900 leading-tight">Business Preferences</h1>
        <p className="text-xs text-gray-400">
          Set criteria so CapMaxx surfaces the right opportunities for your business.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded p-4">
          {!loaded ? (
            <p className="text-sm text-gray-400 py-4">Loading preferences…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Preferred Partnership", ["Any", "Customer", "Supplier", "Partner"]],
                  ["Business Frequency", ["Both", "Ongoing", "Project-based"]],
                  ["Company Size Preference", ["Any", "Small (1–50)", "Mid (51–500)", "Large (500+)"]],
                  ["Geographic Range", ["National", "Regional (500 mi)", "Local (100 mi)"]],
                ].map(([lbl, opts]) => (
                  <div key={lbl as string}>
                    <label className="block text-xs text-gray-400 mb-1">{lbl as string}</label>
                    <select
                      name={lbl as string}
                      defaultValue="Any"
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {(opts as string[]).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Target Industries</label>
                  <input
                    name="Target Industries"
                    value={targetIndustries}
                    onChange={(e) => setTargetIndustries(e.target.value)}
                    placeholder="e.g. Manufacturing, Logistics, Food & Beverage"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Do Not Contact / Excluded Companies</label>
                  <input
                    name="Excluded Companies"
                    value={excludedCompanies}
                    onChange={(e) => setExcludedCompanies(e.target.value)}
                    placeholder="Company names to exclude (comma separated)"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded"
                >
                  Save Preferences
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
