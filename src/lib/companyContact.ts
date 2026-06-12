// Shared company-contact link model + communication-button resolution.
// Used by the public company profile (/company/[slug]), the editable
// company profile (/my-business/company-profile), and the messages chat
// header (/my-messages). Mock data / local state only — no backend.

export interface CompanyContact {
  website?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  /** Microsoft Teams meeting link */
  teams?: string;
  /** Zoom meeting link */
  zoom?: string;
  /** Google Meet link */
  meet?: string;
  /** Calendly / booking link */
  calendly?: string;
}

export type VideoProvider = "teams" | "zoom" | "meet";

export interface VideoLink {
  type: VideoProvider;
  label: string;
  url: string;
}

const VIDEO_PROVIDERS: { type: VideoProvider; label: string }[] = [
  { type: "teams", label: "Microsoft Teams" },
  { type: "zoom", label: "Zoom" },
  { type: "meet", label: "Google Meet" },
];

/** Normalize a phone string into a tel: href. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Normalize a bare domain / URL into an absolute https href. */
export function externalHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** All video-call links present on a contact (Teams / Zoom / Google Meet). */
export function getVideoLinks(contact: CompanyContact | undefined): VideoLink[] {
  if (!contact) return [];
  return VIDEO_PROVIDERS.filter((p) => Boolean(contact[p.type]?.trim())).map(
    (p) => ({ type: p.type, label: p.label, url: externalHref(contact[p.type]!.trim()) })
  );
}

/** Scheduling / booking link, if any. */
export function getScheduleLink(contact: CompanyContact | undefined): string | undefined {
  const v = contact?.calendly?.trim();
  return v ? externalHref(v) : undefined;
}

/** Phone tel: link, if a phone number exists. */
export function getCallLink(contact: CompanyContact | undefined): string | undefined {
  const v = contact?.phone?.trim();
  return v ? telHref(v) : undefined;
}

/**
 * Resolves which communication buttons should render for a contact and how
 * each one behaves. A button is omitted entirely when its link is missing
 * (no dead / disabled buttons). "Message" is always available (internal).
 */
export interface ResolvedCommButtons {
  call?: string;
  video: VideoLink[];
  schedule?: string;
}

export function resolveCommButtons(contact: CompanyContact | undefined): ResolvedCommButtons {
  return {
    call: getCallLink(contact),
    video: getVideoLinks(contact),
    schedule: getScheduleLink(contact),
  };
}
