"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { resolveCommButtons, type CompanyContact, type VideoLink } from "@/lib/companyContact";
import { companySlugFromName } from "@/lib/mockCompanies";
import { sendMessageToCompany } from "@/lib/db/messages";
import { fetchMyThreads, fetchThreadMessages } from "@/lib/db/reads";

type MsgTab = "messages" | "interest";

interface Conversation {
  id: string;
  company: string;
  location: string;
  industry: string;
  avatar: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const conversations: Conversation[] = [
  { id: "1", company: "Summit Cold Storage LLC", location: "Denver, CO", industry: "Logistics", avatar: "S", color: "bg-purple-100 text-purple-800", lastMessage: "Are you able to handle a run of 200 units next week?", time: "2h ago", unread: 2 },
  { id: "2", company: "BlueLine Transport Inc.", location: "Atlanta, GA", industry: "Freight", avatar: "B", color: "bg-sky-100 text-sky-800", lastMessage: "Thanks for the quote. We'd like to move forward.", time: "Yesterday", unread: 0 },
  { id: "3", company: "GreenLeaf Packaging Co.", location: "Portland, OR", industry: "Packaging", avatar: "G", color: "bg-green-100 text-green-800", lastMessage: "Do you work with biodegradable materials?", time: "Mon", unread: 1 },
  { id: "4", company: "TechAssembly Solutions", location: "Austin, TX", industry: "Electronics", avatar: "T", color: "bg-orange-100 text-orange-800", lastMessage: "Let's set up a call to discuss the project scope.", time: "Mar 28", unread: 0 },
  { id: "5", company: "Apex Fabrication Group", location: "Detroit, MI", industry: "Manufacturing", avatar: "A", color: "bg-red-100 text-red-800", lastMessage: "We can accommodate up to 300 parts per week.", time: "Mar 25", unread: 0 },
  { id: "6", company: "Hartwell Injection Molding", location: "Cincinnati, OH", industry: "Plastics", avatar: "H", color: "bg-yellow-100 text-yellow-800", lastMessage: "Sent you the spec sheet. Let me know if you have questions.", time: "Mar 22", unread: 0 },
];

type ChatMessage = { from: "me" | "them"; text: string; time: string; file?: { name: string; size: string } };

const initialThreads: Record<string, ChatMessage[]> = {
  "1": [
    { from: "them", text: "Hi, we came across your CNC machining listing on CapMaxx.", time: "Mar 30, 9:12 AM" },
    { from: "me", text: "Hi! Thanks for reaching out. What are you looking for?", time: "Mar 30, 9:45 AM" },
    { from: "them", text: "We need precision parts for a storage rack system. About 150 units.", time: "Mar 30, 10:02 AM" },
    { from: "me", text: "That's well within our capacity. Can you share specs?", time: "Mar 30, 10:20 AM" },
    { from: "them", text: "Specifications attached.", time: "Mar 30, 10:30 AM", file: { name: "rack_specs_v2.pdf", size: "1.4 MB" } },
    { from: "them", text: "What's your typical lead time for 150 units?", time: "Mar 30, 10:35 AM" },
    { from: "me", text: "Usually 3–5 business days for orders under 200 units.", time: "Mar 30, 11:00 AM" },
    { from: "them", text: "Are you able to handle a run of 200 units next week?", time: "2h ago" },
  ],
  "2": [
    { from: "them", text: "Hello, we need freight services for shipments to the Midwest.", time: "Apr 1, 2:00 PM" },
    { from: "me", text: "We can help. What's the volume and frequency?", time: "Apr 1, 2:30 PM" },
    { from: "them", text: "About 3 loads per week, dry van.", time: "Apr 1, 3:00 PM" },
    { from: "me", text: "That works. Quote sent to your email.", time: "Apr 1, 3:15 PM" },
    { from: "them", text: "Thanks for the quote. We'd like to move forward.", time: "Yesterday, 4:00 PM" },
  ],
  "3": [
    { from: "them", text: "Hi, looking for a packaging supplier for a new product line.", time: "Mar 28, 10:00 AM" },
    { from: "me", text: "Happy to help. What type of packaging do you need?", time: "Mar 28, 10:30 AM" },
    { from: "them", text: "Do you work with biodegradable materials?", time: "Mon, 9:00 AM" },
  ],
  "4": [
    { from: "them", text: "We need PCB assembly capacity for a new product launch.", time: "Mar 27, 11:00 AM" },
    { from: "me", text: "Sure, what are the specs and volumes?", time: "Mar 27, 11:30 AM" },
    { from: "them", text: "Let's set up a call to discuss the project scope.", time: "Mar 28, 9:00 AM" },
  ],
  "5": [
    { from: "them", text: "We're interested in your sheet metal fabrication.", time: "Mar 25, 8:00 AM" },
    { from: "me", text: "Great — we handle welding and fabrication up to ½ inch steel.", time: "Mar 25, 9:00 AM" },
    { from: "them", text: "We can accommodate up to 300 parts per week.", time: "Mar 25, 2:00 PM" },
  ],
  "6": [
    { from: "them", text: "Hello, do you do injection molding for small runs?", time: "Mar 22, 10:00 AM" },
    { from: "me", text: "Yes, minimum order is 500 parts.", time: "Mar 22, 10:45 AM" },
    { from: "them", text: "Sent you the spec sheet. Let me know if you have questions.", time: "Mar 22, 11:30 AM", file: { name: "part_drawing_v1.pdf", size: "840 KB" } },
  ],
};

const recentInterest = [
  { id: "1", company: "Redrock Mining Supply", location: "Phoenix, AZ", listing: "CNC Machining Capacity", action: "Viewed your listing", time: "1 hour ago", avatar: "R", color: "bg-stone-100 text-stone-800" },
  { id: "2", company: "NexGen Devices", location: "San Jose, CA", listing: "CNC Machining Capacity", action: "Saved your listing", time: "3 hours ago", avatar: "N", color: "bg-cyan-100 text-cyan-800" },
  { id: "3", company: "FreshBake Distribution", location: "Dallas, TX", listing: "Precision Parts – Overflow", action: "Viewed your listing", time: "Yesterday", avatar: "F", color: "bg-lime-100 text-lime-800" },
  { id: "4", company: "BuildRight Contractors", location: "Houston, TX", listing: "CNC Machining Capacity", action: "Requested connection", time: "Yesterday", avatar: "B", color: "bg-amber-100 text-amber-800" },
  { id: "5", company: "Orion Sportswear", location: "Los Angeles, CA", listing: "CNC Machining Capacity", action: "Viewed your listing", time: "2 days ago", avatar: "O", color: "bg-pink-100 text-pink-800" },
];

// Per-conversation contact links (mock). Buttons hide when a link is missing.
const contactLinks: Record<string, CompanyContact> = {
  "1": { phone: "+1 (720) 555-0147", zoom: "https://zoom.us/j/12345678", calendly: "https://calendly.com/summit-cold" },
  "2": { phone: "+1 (404) 555-0192", calendly: "https://calendly.com/blueline" },
  "3": { phone: "+1 (503) 555-0234", teams: "https://teams.microsoft.com/meet", calendly: "https://calendly.com/greenleaf" },
  // No phone → Call button hidden; has Google Meet + scheduling.
  "4": { meet: "https://meet.google.com/abc-defg-hij", calendly: "https://calendar.google.com/r" },
  // Phone only → Video Call + Schedule buttons hidden.
  "5": { phone: "+1 (313) 555-0129" },
  "6": { phone: "+1 (513) 555-0267", zoom: "https://zoom.us/j/99887766", calendly: "https://outlook.office.com/bookings/hartwell" },
};

// Profile modal data
const profileData: Record<string, { company: string; location: string; industry: string; subcategory: string; teamSize: string; website: string; about: string; certifications: string[]; listings: { title: string; type: "offer" | "need" }[] }> = {
  "1": { company: "Summit Cold Storage LLC", location: "Denver, CO", industry: "Logistics", subcategory: "Warehousing", teamSize: "28", website: "summitcoldstorage.com", about: "Summit Cold Storage provides refrigerated and frozen warehousing solutions across the Rocky Mountain region, with 24/7 operations and FDA-certified facilities.", certifications: ["FDA", "SQF Level 2"], listings: [{ title: "Refrigerated Warehousing & Distribution", type: "offer" }, { title: "Looking for Frozen Food Co-Pack Partner", type: "need" }] },
  "2": { company: "BlueLine Transport Inc.", location: "Atlanta, GA", industry: "Freight", subcategory: "Dry Van", teamSize: "22", website: "bluelinetransport.com", about: "BlueLine runs dry van and flatbed freight throughout the Southeast and Midwest with a fleet of 22 company-owned trucks.", certifications: ["FMCSA", "DOT"], listings: [{ title: "Flatbed & Dry Van Freight, OTR", type: "offer" }] },
  "3": { company: "GreenLeaf Packaging Co.", location: "Portland, OR", industry: "Packaging", subcategory: "Corrugated", teamSize: "35", website: "greenleafpkg.com", about: "GreenLeaf designs and manufactures sustainable corrugated packaging solutions for retail and e-commerce brands.", certifications: ["FSC", "ISO 14001"], listings: [{ title: "Custom Corrugated Packaging, Design", type: "offer" }, { title: "Seeking Biodegradable Film Supplier", type: "need" }] },
  "4": { company: "TechAssembly Solutions", location: "Austin, TX", industry: "Electronics", subcategory: "PCB Assembly", teamSize: "45", website: "techassemblysolutions.com", about: "Contract electronics manufacturer specializing in PCB assembly, box builds, and testing services for OEMs.", certifications: ["IPC-A-610", "ISO 9001"], listings: [{ title: "PCB Assembly, Electronics Manufacturing", type: "offer" }] },
  "5": { company: "Apex Fabrication Group", location: "Detroit, MI", industry: "Manufacturing", subcategory: "Fabrication", teamSize: "18", website: "apexfab.com", about: "Apex specializes in custom sheet metal fabrication and structural welding for automotive and industrial clients.", certifications: ["AWS D1.1"], listings: [{ title: "Sheet Metal Fabrication, Welding", type: "offer" }] },
  "6": { company: "Hartwell Injection Molding", location: "Cincinnati, OH", industry: "Plastics", subcategory: "Injection Molding", teamSize: "20", website: "hartwellmolding.com", about: "Hartwell runs 12 injection molding presses producing plastic components for medical, consumer, and industrial markets.", certifications: ["ISO 9001"], listings: [{ title: "Injection Molding, Plastic Parts", type: "offer" }] },
};

function VideoIcon({ type }: { type: VideoLink["type"] }) {
  const map: Record<VideoLink["type"], { bg: string; label: string }> = {
    teams: { bg: "bg-indigo-700", label: "T" },
    zoom:  { bg: "bg-blue-600",   label: "Z" },
    meet:  { bg: "bg-green-600",  label: "M" },
  };
  const { bg, label } = map[type];
  return (
    <span className={`w-4 h-4 shrink-0 inline-flex items-center justify-center rounded text-[9px] font-bold text-white leading-none ${bg}`}>
      {label}
    </span>
  );
}

export default function MyMessagesPage() {
  const [activeConv, setActiveConv] = useState("1");
  const [msgTab, setMsgTab] = useState<MsgTab>("messages");
  const [draft, setDraft] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(initialThreads);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; size: string } | null>(null);
  const [convList, setConvList] = useState<Conversation[]>(conversations);
  // Maps a conversation/thread id → the real company UUID for sending messages.
  const [threadCompany, setThreadCompany] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const conv =
    convList.find((c) => c.id === activeConv) ??
    convList[0] ?? {
      id: "",
      company: "No conversations",
      location: "",
      industry: "",
      avatar: "·",
      color: "bg-gray-100 text-gray-500",
      lastMessage: "",
      time: "",
      unread: 0,
    };
  const messages = threads[activeConv] || [];
  const profile = profileData[activeConv];
  const totalUnread = convList.reduce((n, c) => n + c.unread, 0);
  const { call, video, schedule } = resolveCommButtons(contactLinks[activeConv]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(e.target as Node)) setVideoMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load real threads when Supabase is configured; otherwise keep the mock
  // conversations so the dev app stays functional.
  useEffect(() => {
    let active = true;
    void fetchMyThreads().then((data) => {
      if (!active || !data) return;
      const mapped: Conversation[] = data.map((t) => ({
        id: t.id,
        company: t.company,
        location: "",
        industry: t.subject || "",
        avatar: (t.company[0] ?? "C").toUpperCase(),
        color: "bg-blue-100 text-blue-800",
        lastMessage: t.lastMessage,
        time: t.time,
        unread: t.unread,
      }));
      setConvList(mapped);
      setThreadCompany(Object.fromEntries(data.map((t) => [t.id, t.companyId])));
      if (mapped.length > 0) setActiveConv(mapped[0].id);
    });
    return () => {
      active = false;
    };
  }, []);

  // Load the active thread's real messages when available (no-op on mock).
  useEffect(() => {
    let active = true;
    void fetchThreadMessages(activeConv).then((msgs) => {
      if (active && msgs) setThreads((prev) => ({ ...prev, [activeConv]: msgs }));
    });
    return () => {
      active = false;
    };
  }, [activeConv]);

  // Send the current draft. Appends the message (and any pending attachment) to
  // the active thread in local state, then clears the composer. Persistence is
  // guarded — sendMessageToCompany no-ops when Supabase isn't configured.
  const handleSend = () => {
    const text = draft.trim();
    if (!text && !pendingAttachment) return;

    const newMsgs: ChatMessage[] = [];
    if (text) newMsgs.push({ from: "me", text, time: "Just now" });
    if (pendingAttachment) newMsgs.push({ from: "me", text: "", time: "Just now", file: pendingAttachment });

    setThreads((prev) => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] ?? []), ...newMsgs],
    }));

    // Persist against the real company UUID for this thread when available.
    // Falls back to activeConv for mock data (where it no-ops without Supabase).
    if (text) void sendMessageToCompany(threadCompany[activeConv] ?? activeConv, text);
    setDraft("");
    setPendingAttachment(null);
  };

  // Format a File's byte size into a short human-readable label.
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingAttachment({ name: file.name, size: formatSize(file.size) });
    e.target.value = ""; // allow re-selecting the same file later
    setShowAttach(false);
  };

  const handleVideoClick = () => {
    if (video.length === 0) return;
    if (video.length === 1) { window.open(video[0].url, "_blank"); return; }
    setVideoMenuOpen((v) => !v);
  };

  const term = search.trim().toLowerCase();
  const filteredConvs = convList.filter((c) => {
    if (filter === "unread" && c.unread === 0) return false;
    if (term && !c.company.toLowerCase().includes(term) && !c.lastMessage.toLowerCase().includes(term)) return false;
    return true;
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200">
        <h1 className="text-sm font-bold text-gray-900 pr-4">My Messages</h1>
        <button onClick={() => setMsgTab("messages")}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${msgTab === "messages" ? "border-blue-700 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Messages
          {totalUnread > 0 && (
            <span className="ml-1.5 text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </button>
        <button onClick={() => setMsgTab("interest")}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${msgTab === "interest" ? "border-blue-700 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Recent Interest
          <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-600 font-bold px-1.5 py-0.5 rounded-full">{recentInterest.length}</span>
        </button>
      </div>

      {/* ── MESSAGES ── */}
      {msgTab === "messages" && (
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white" style={{ height: "calc(100vh - 118px)", minHeight: "520px" }}>

          {/* LEFT: Conversation list — 25% */}
          <div className="w-64 shrink-0 flex flex-col border-r border-gray-200">
            {/* Search */}
            <div className="p-2.5 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-300" />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-1.5 px-2.5 py-2 border-b border-gray-100">
              <button onClick={() => setFilter("all")}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filter === "all" ? "bg-blue-700 text-white font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                All
              </button>
              <button onClick={() => setFilter("unread")}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filter === "unread" ? "bg-blue-700 text-white font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                Unread {totalUnread > 0 && `(${totalUnread})`}
              </button>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center pt-6">
                  {term ? "No conversations match your search" : "No unread messages"}
                </p>
              ) : (
                filteredConvs.map((c) => (
                  <button key={c.id} onClick={() => { setActiveConv(c.id); setProfileOpen(false); setVideoMenuOpen(false); }}
                    className={`w-full text-left px-3 py-3 flex gap-2.5 items-start transition-colors border-b border-gray-50 ${
                      activeConv === c.id
                        ? "bg-blue-50 border-r-2 border-blue-700"
                        : "hover:bg-gray-50"
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${c.color}`}>
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[12px] truncate ${c.unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                          {c.company}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">{c.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[11px] truncate leading-snug ${c.unread > 0 ? "text-gray-700" : "text-gray-400"}`}>
                          {c.lastMessage}
                        </p>
                        {c.unread > 0 && (
                          <span className="ml-1.5 w-4 h-4 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Chat — 75% */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${conv.color}`}>
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{conv.company}</div>
                <div className="text-[11px] text-gray-400">{conv.industry} · {conv.location}</div>
              </div>

              {/* Icon actions — each hidden when its link is missing */}
              <div className="flex items-center gap-0.5 shrink-0">

                {/* Call — phone (tel:); hidden when no phone */}
                {call && (
                  <a
                    href={call}
                    title="Call"
                    className="p-2 rounded-md transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                    <svg style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                )}

                {/* Video Call — Teams / Zoom / Meet; single opens directly, multiple shows dropdown; hidden when none */}
                {video.length > 0 && (
                  <div className="relative" ref={videoRef}>
                    <button
                      title="Video Call"
                      onClick={handleVideoClick}
                      className={`p-2 rounded-md transition-colors ${
                        videoMenuOpen
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      }`}>
                      <svg style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {videoMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                        {video.map((link) => (
                          <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                            onClick={() => setVideoMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors">
                            <VideoIcon type={link.type} />
                            <span className="text-sm text-gray-800">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Meeting — Calendly / booking; hidden when none */}
                {schedule && (
                  <a
                    href={schedule}
                    target="_blank"
                    rel="noreferrer"
                    title="Schedule Meeting"
                    className="p-2 rounded-md transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                    <svg style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </a>
                )}

                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button title="View Profile" onClick={() => setProfileOpen((v) => !v)}
                  className={`p-2 rounded-md transition-colors ${profileOpen ? "text-blue-700 bg-blue-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                  <svg style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main area: thread + optional profile drawer side by side */}
            <div className="flex flex-1 min-h-0">

              {/* Message thread */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                      {msg.file ? (
                        <div className={`max-w-xs flex flex-col gap-1 ${msg.from === "me" ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="w-8 h-8 rounded bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{msg.file.name}</p>
                              <p className="text-[10px] text-gray-400">{msg.file.size}</p>
                            </div>
                            <button className="ml-1 text-blue-600 hover:text-blue-700 shrink-0">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>
                      ) : (
                        <div className={`max-w-[60%] flex flex-col gap-0.5 ${msg.from === "me" ? "items-end" : "items-start"}`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.from === "me"
                              ? "bg-blue-700 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}>
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">{msg.time}</span>
                            {msg.from === "me" && (
                              <svg className="w-3 h-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Compose */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
                  {/* Hidden inputs backing the Attach File / Attach Photo actions */}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChosen} />
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChosen} />

                  {showAttach && (
                    <div className="flex gap-1.5 flex-wrap mb-2.5">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
                        <span>📎</span> Attach File
                      </button>
                      <button onClick={() => photoInputRef.current?.click()}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
                        <span>🖼</span> Attach Photo
                      </button>
                    </div>
                  )}

                  {pendingAttachment && (
                    <div className="flex items-center gap-2 mb-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg w-fit max-w-full">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-xs text-gray-700 truncate">{pendingAttachment.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{pendingAttachment.size}</span>
                      <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-gray-600 shrink-0" title="Remove attachment">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <button onClick={() => setShowAttach((v) => !v)}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${showAttach ? "text-blue-700 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                      title="Attach">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <input type="text" value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Write a message..."
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                    <button onClick={handleSend}
                      className={`p-2 rounded-full transition-colors shrink-0 ${draft.trim() || pendingAttachment ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-gray-100 text-gray-400 cursor-default"}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile drawer — slides in when profileOpen */}
              {profileOpen && profile && (
                <div className="w-72 border-l border-gray-100 flex flex-col overflow-y-auto bg-white shrink-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Company Profile</span>
                    <button onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Company header */}
                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold mb-3 ${conv.color}`}>
                      {conv.avatar}
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-0.5">{profile.company}</div>
                    <div className="text-xs text-gray-400 mb-1">{profile.industry} › {profile.subcategory}</div>
                    <div className="text-xs text-gray-500">{profile.location}</div>
                  </div>

                  {/* About */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed">{profile.about}</p>
                  </div>

                  {/* Details */}
                  <div className="px-4 py-3 border-b border-gray-100 space-y-1.5 text-xs">
                    <div className="flex gap-2"><span className="text-gray-400 w-16 shrink-0">Team Size</span><span className="text-gray-700">{profile.teamSize} employees</span></div>
                    <div className="flex gap-2"><span className="text-gray-400 w-16 shrink-0">Website</span><a href={`https://${profile.website}`} className="text-blue-700 hover:underline truncate">{profile.website}</a></div>
                  </div>

                  {/* Certifications */}
                  {profile.certifications.length > 0 && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.certifications.map((cert) => (
                          <span key={cert} className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium">
                            <svg className="w-2.5 h-2.5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Listings */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Listings</p>
                    <div className="space-y-1.5">
                      {profile.listings.map((l, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${
                            l.type === "offer" ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                          }`}>
                            {l.type === "offer" ? "Offer" : "Need"}
                          </span>
                          <span className="text-xs text-gray-700 leading-snug">{l.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos placeholder */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Photos</p>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT INTEREST ── */}
      {msgTab === "interest" && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Companies that interacted with your listings</span>
            <span className="text-xs text-gray-400">{recentInterest.length} recent</span>
          </div>
          {recentInterest.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${item.color}`}>
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{item.company}</span>
                  <span className="text-xs text-gray-400">{item.location}</span>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{item.action}</span>
                  {" · "}{item.listing}
                  {" · "}<span className="text-gray-400">{item.time}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/company/${companySlugFromName(item.company)}`}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors">
                  View Profile
                </Link>
                <button
                  onClick={() => setMsgTab("messages")}
                  className="text-xs px-3 py-1.5 text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
