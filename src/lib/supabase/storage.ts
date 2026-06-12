"use client";

// ──────────────────────────────────────────────────────────────────────────────
// Supabase Storage upload helpers (client-safe, guarded)
//
// Buckets (created by schema.sql, all public-read):
//   - company-logos    → company logo images
//   - company-covers   → company cover images
//   - listing-images   → listing primary images
//   - listing-photos   → listing additional photos
//   - listing-videos   → listing videos
//
// uploadToBucket() returns a public URL on success. When Supabase is not
// configured (or upload fails) it falls back to an in-browser object URL so the
// UI can still show a preview — the demo never breaks. Callers should store the
// returned URL on the relevant table (companies.logo_url, listing_media.url, …).
// ──────────────────────────────────────────────────────────────────────────────

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CapmaxxBucket =
  | "company-logos"
  | "company-covers"
  | "listing-images"
  | "listing-photos"
  | "listing-videos";

export interface UploadResult {
  url: string;
  /** true when the URL is a real, persisted Supabase public URL. */
  persisted: boolean;
  error?: string;
}

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot) : "";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "file";
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
}

function objectUrlFallback(file: File): UploadResult {
  return {
    url: typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : "",
    persisted: false,
  };
}

/**
 * Upload a file to a CapMaxx storage bucket and return its public URL. Falls
 * back to a local object URL (preview-only) when Supabase isn't configured or
 * the upload errors out, so previews always work in the demo.
 */
export async function uploadToBucket(
  bucket: CapmaxxBucket,
  file: File,
  pathPrefix = "",
): Promise<UploadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return objectUrlFallback(file);

  const path = `${pathPrefix ? `${pathPrefix.replace(/\/$/, "")}/` : ""}${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    return { ...objectUrlFallback(file), error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, persisted: true };
}

export const uploadCompanyLogo = (file: File, prefix = "") => uploadToBucket("company-logos", file, prefix);
export const uploadCompanyCover = (file: File, prefix = "") => uploadToBucket("company-covers", file, prefix);
export const uploadListingPrimaryImage = (file: File, prefix = "") => uploadToBucket("listing-images", file, prefix);
export const uploadListingPhoto = (file: File, prefix = "") => uploadToBucket("listing-photos", file, prefix);
export const uploadListingVideo = (file: File, prefix = "") => uploadToBucket("listing-videos", file, prefix);
