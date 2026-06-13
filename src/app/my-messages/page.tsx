"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { resolveCommButtons, type VideoLink } from "@/lib/companyContact";
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

type ChatMessage = { from: "me" | "them"; text: string; time: string; file?: { name: string; size: string } };

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
  const [activeConv, setActiveConv] = useState("");
  const [msgTab, setMsgTab] = useState<MsgTab>("messages");
  const [draft, setDraft] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; size: string } | null>(null);
  const [convList, setConvList] = useState<Conversation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [threadCompany, setThreadCompany] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const conv =
    convList.find((c) => c.id === activeConv) ??
    convList[0] ?? {
      id: "",
      company: "No conversations yet",
      location: "",
      industry: "",
      avatar: "·",
      color: "bg-gray-100 text-gray-500",
      lastMessage: "",
      time: "",
      unread: 0,
    };
  const messages = threads[activeConv] || [];
  const totalUnread = convList.reduce((n, c) => n + c.unread, 0);
  const { call, video, schedule } = resolveCommButtons(undefined);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(e.target as Node)) setVideoMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load real threads when Supabase is configured.
  useEffect(() => {
    let active = true;
    void fetchMyThreads().then((data) => {
      if (!active) return;
      if (data !== null) {
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
      }
      setLoaded(true);
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
    <div className="max-w-screen-xl mx-auto px-4 py-4 min-w-0">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200 overflow-x-auto min-w-0">
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
        </button>
      </div>

      {/* ── MESSAGES ── */}
      {msgTab === "messages" && (
        <div
          className={`flex flex-col lg:flex-row rounded-lg border border-gray-200 overflow-hidden bg-white lg:h-[calc(100vh-118px)] lg:min-h-[520px] ${
            mobileShowChat ? "h-[calc(100dvh-118px)]" : "min-h-[480px]"
          }`}
        >

          {/* LEFT: Conversation list */}
          <div className={`w-full lg:w-64 shrink-0 flex flex-col border-r border-gray-200 min-h-0 ${mobileShowChat ? "hidden lg:flex" : "flex"}`}>
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
                <p className="text-xs text-gray-400 text-center pt-6 px-3">
                  {!loaded
                    ? "Loading conversations…"
                    : term
                      ? "No conversations match your search"
                      : filter === "unread"
                        ? "No unread messages"
                        : "No messages yet. When businesses contact you, conversations will appear here."}
                </p>
              ) : (
                filteredConvs.map((c) => (
                  <button key={c.id} onClick={() => { setActiveConv(c.id); setProfileOpen(false); setVideoMenuOpen(false); setMobileShowChat(true); }}
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

          {/* RIGHT: Chat */}
          <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobileShowChat ? "flex" : "hidden lg:flex"}`}>

            {/* Chat header */}
            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-3 border-b border-gray-100 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="lg:hidden p-1.5 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 shrink-0"
                aria-label="Back to conversations"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
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
              <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${profileOpen ? "hidden lg:flex" : "flex"}`}>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center px-6">
                      <p className="text-sm text-gray-500">
                        {convList.length === 0
                          ? "No conversations yet. Messages from other businesses will appear here."
                          : "No messages in this conversation yet. Say hello to get started."}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
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
                  ))
                  )}
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

              {/* Profile drawer — full-screen on mobile, side panel on desktop */}
              {profileOpen && activeConv && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white lg:static lg:relative lg:inset-auto lg:w-72 lg:z-auto border-l border-gray-100 overflow-y-auto shrink-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Company Profile</span>
                    <button onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold mb-3 ${conv.color}`}>
                      {conv.avatar}
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-0.5">{conv.company}</div>
                    {conv.industry && (
                      <div className="text-xs text-gray-400 mb-1">{conv.industry}</div>
                    )}
                  </div>

                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      View the full company profile to see listings, certifications, and contact details.
                    </p>
                    <Link
                      href={`/company/${companySlugFromName(conv.company)}`}
                      className="inline-block mt-3 text-xs font-medium text-blue-700 hover:underline"
                    >
                      Open full profile →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT INTEREST ── */}
      {msgTab === "interest" && (
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-800">No listing interest yet</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            When businesses view, save, or request connections on your listings, those interactions will show up here.
          </p>
          <Link href="/my-business/listings" className="inline-block mt-4 text-xs font-medium text-blue-700 hover:underline">
            Manage your listings →
          </Link>
        </div>
      )}
    </div>
  );
}
