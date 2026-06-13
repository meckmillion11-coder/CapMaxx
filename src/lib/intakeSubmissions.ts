"use client";

import {
  type IntakeSubmission,
  type NewSubmissionInput,
  type SubmissionStatus,
  mapDbRowToSubmission,
} from "@/lib/intakeTypes";

export type { IntakeSubmission, NewSubmissionInput, SubmissionStatus };
export { mapDbRowToSubmission };

const STORAGE_KEY = "capmaxx_intake_submissions";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

let cache: IntakeSubmission[] | null = null;
const listeners = new Set<() => void>();

function readRaw(): IntakeSubmission[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IntakeSubmission[]) : null;
  } catch {
    return null;
  }
}

function writeRaw(submissions: IntakeSubmission[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    // ignore
  }
}

function ensureCache(): IntakeSubmission[] {
  if (cache) return cache;
  cache = readRaw() ?? [];
  return cache;
}

function commit(next: IntakeSubmission[]): IntakeSubmission[] {
  cache = next;
  writeRaw(next);
  listeners.forEach((l) => l());
  return next;
}

export function subscribeSubmissions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSubmissions(): IntakeSubmission[] {
  if (!isBrowser()) return [];
  return ensureCache();
}

export function getServerSubmissions(): IntakeSubmission[] {
  return [];
}

export function addSubmission(input: NewSubmissionInput): IntakeSubmission {
  const submission: IntakeSubmission = {
    ...input,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: new Date().toISOString(),
    status: "new",
  };
  commit([submission, ...ensureCache()]);
  void mirrorSubmitToApi(input);
  return submission;
}

async function mirrorSubmitToApi(input: NewSubmissionInput): Promise<void> {
  try {
    await fetch("/api/intake/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // local cache remains source when offline
  }
}

export function replaceSubmissions(list: IntakeSubmission[]): IntakeSubmission[] {
  return commit(list);
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus): IntakeSubmission[] {
  return commit(ensureCache().map((s) => (s.id === id ? { ...s, status } : s)));
}

export function updateSubmission(id: string, patch: Partial<IntakeSubmission>): IntakeSubmission[] {
  return commit(ensureCache().map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

export function updateSubmissionNote(id: string, adminNote: string): IntakeSubmission[] {
  return updateSubmission(id, { adminNote });
}

export function deleteSubmission(id: string): IntakeSubmission[] {
  return commit(ensureCache().filter((s) => s.id !== id));
}

export const contactMethods = ["Email", "Phone", "Text / SMS", "Video Call", "Any"] as const;
export type ContactMethod = (typeof contactMethods)[number];
