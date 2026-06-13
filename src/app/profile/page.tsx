"use client";

import { useState, useEffect } from "react";
import { savePreferences } from "@/lib/db/profiles";
import { fetchMyProfile, type MyProfileData } from "@/lib/db/reads";

const THEME_KEY = "capmaxx-theme";

type ProfileTab = "account" | "membership" | "notifications" | "appearance" | "users";

type Role = "Owner" | "Manager" | "Employee";

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const emailNotifications = [
  "New Message",
  "New Connection Request",
  "Connection Accepted",
  "Listing Saved",
  "Listing Expiring Soon",
  "New Opportunity Match",
  "Weekly Activity Summary",
];

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("account");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Employee");
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [loaded, setLoaded] = useState(false);

  const tabDef: { id: ProfileTab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "membership", label: "Membership" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
    { id: "users", label: "Company Users" },
  ];

  const profileCompletion = profile?.profileCompletion ?? 0;
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.email?.split("@")[0] ||
    "Your account";
  const avatarLetter = (displayName[0] ?? "Y").toUpperCase();
  const subtitle = [
    profile?.email,
    profile?.role && profile?.companyName
      ? `${profile.role}, ${profile.companyName}`
      : profile?.role || profile?.companyName,
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    let active = true;
    void fetchMyProfile().then((data) => {
      if (!active) return;
      setProfile(data);
      if (data) {
        const ownerName = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.email;
        setUsers([
          {
            id: "owner",
            name: ownerName,
            email: data.email,
            role: (data.role as Role) || "Owner",
          },
        ]);
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Read persisted theme on mount and apply it to <html>.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const initial: "light" | "dark" = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function applyTheme(next: "light" | "dark") {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function handleInvite() {
    const email = inviteEmail.trim();
    if (!email) return;
    setUsers((prev) => [
      ...prev,
      { id: String(Date.now()), name: email.split("@")[0], email, role: inviteRole },
    ]);
    setInviteEmail("");
    setInviteRole("Employee");
  }

  function changeRole(id: string, role: Role) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  // Save email-notification toggles. Guarded — persists to Supabase
  // (company_profiles.preferences.notifications) when configured, else no-op.
  function handleSaveNotifications(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const prefs: Record<string, boolean> = {};
    emailNotifications.forEach((label) => {
      prefs[label] = fd.get(label) === "on";
    });
    void savePreferences({ notifications: prefs });
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
          {avatarLetter}
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            {loaded ? displayName : "Loading profile…"}
          </h1>
          <p className="text-xs text-gray-400 truncate">{loaded ? subtitle || "Complete your account details below." : ""}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {tabDef.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id ? "border-blue-700 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ACCOUNT ── */}
      {tab === "account" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["First Name", profile?.firstName ?? ""],
                ["Last Name", profile?.lastName ?? ""],
                ["Email", profile?.email ?? ""],
                ["Phone Number", profile?.phone ?? ""],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                  <input defaultValue={val} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded">Save Changes</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h2>
            <div className="space-y-2.5">
              {["Current Password", "New Password", "Confirm New Password"].map((lbl) => (
                <div key={lbl}>
                  <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                  <input type="password" placeholder="••••••••" className="w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded">Update Password</button>
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded p-4">
            <h2 className="text-sm font-semibold text-red-700 mb-1">Delete Account</h2>
            <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button className="px-4 py-1.5 text-[13px] font-medium text-red-700 border border-red-300 hover:bg-red-50 rounded">Delete Account</button>
          </div>
        </div>
      )}

      {/* ── MEMBERSHIP ── */}
      {tab === "membership" && (
        <div className="max-w-3xl space-y-4">
          <div className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Membership Type</div>
              <div className="text-base font-bold text-gray-900">Free Member</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {profile?.joinedAt ? `Joined ${profile.joinedAt}` : "Member since signup"}
              </div>
            </div>
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 font-medium px-2.5 py-1 rounded-full shrink-0">Active</span>
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">Company Profile Completion</span>
              <span className="text-sm font-semibold text-blue-700">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Complete your company profile to improve visibility and matches.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Active Listings", value: String(profile?.activeListings ?? 0) },
              { label: "Connections", value: String(profile?.connections ?? 0) },
              { label: "Messages", value: String(profile?.messages ?? 0) },
              { label: "Profile Views", value: String(profile?.profileViews ?? 0) },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === "notifications" && (
        <form onSubmit={handleSaveNotifications} className="max-w-2xl space-y-4">
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Email Notifications</span>
              <p className="text-xs text-gray-400 mt-0.5">Choose which emails you&apos;d like to receive.</p>
            </div>
            {emailNotifications.map((label) => (
              <label key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer">
                <span className="text-[13px] text-gray-700">{label}</span>
                <input type="checkbox" name={label} defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-700 cursor-pointer" />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded">Save Preferences</button>
          </div>
        </form>
      )}

      {/* ── APPEARANCE ── */}
      {tab === "appearance" && (
        <div className="max-w-lg space-y-4">
          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Language</h2>
            <label className="block text-xs text-gray-400 mb-1">Display Language</label>
            <select className="w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
              <option>English</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">More languages coming soon.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Theme</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => applyTheme("light")}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded text-[13px] font-medium transition-colors ${
                  theme === "light" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                Light Mode
              </button>
              <button onClick={() => applyTheme("dark")}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded text-[13px] font-medium transition-colors ${
                  theme === "dark" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                Dark Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPANY USERS ── */}
      {tab === "users" && (
        <div className="max-w-3xl space-y-4">
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <div>
                <span className="text-sm font-semibold text-gray-900">Company Users</span>
                <p className="text-xs text-gray-400 mt-0.5">People who can access this company account.</p>
              </div>
              <span className="text-xs text-gray-400">{users.length} users</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">{u.name}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.role === "Owner" ? (
                    <span className="text-xs px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 font-medium">Owner</span>
                  ) : (
                    <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Manager</option>
                      <option>Employee</option>
                    </select>
                  )}
                  {u.role !== "Owner" && (
                    <button onClick={() => removeUser(u.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Invite User</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}
                className="px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                <option>Manager</option>
                <option>Employee</option>
              </select>
              <button onClick={handleInvite} className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded whitespace-nowrap">Invite User</button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Roles: <span className="font-medium text-gray-600">Owner</span> manages everything, <span className="font-medium text-gray-600">Manager</span> manages listings and users, <span className="font-medium text-gray-600">Employee</span> can view and message.</p>
          </div>
        </div>
      )}
    </div>
  );
}
