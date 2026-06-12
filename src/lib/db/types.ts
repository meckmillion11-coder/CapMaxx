// Shared row types for the CapMaxx Supabase tables. These intentionally mirror
// the columns in schema.sql. They are loose (most fields optional) so partial
// inserts/updates from the UI type-check cleanly.

export interface DbUser {
  id: string;
  auth_user_id?: string | null;
  email: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbCompany {
  id: string;
  owner_id?: string | null;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  location?: string | null;
  industry?: string | null;
  subcategory?: string | null;
  business_type?: string | null;
  founded?: string | null;
  employee_range?: string | null;
  cage_code?: string | null;
  naics_code?: string | null;
  duns_number?: string | null;
  tax_id?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  logo_url?: string | null;
  logo_initials?: string | null;
  logo_color?: string | null;
  cover_url?: string | null;
  cover_label?: string | null;
  cover_gradient?: string | null;
  about?: string | null;
  about_extended?: string | null;
  capabilities?: string[];
  tags?: string[];
  verified?: boolean;
  verification_status?: "unverified" | "pending" | "verified" | "rejected";
  verified_at?: string | null;
  verified_by?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbListing {
  id: string;
  company_id: string;
  type: "offer" | "need";
  title: string;
  capability?: string | null;
  capacity?: string | null;
  industry?: string | null;
  subcategory?: string | null;
  location?: string | null;
  tags?: string[];
  status?: string;
  availability_status?: string;
  verified?: boolean;
  views?: number;
  posted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbIntakeSubmission {
  id: string;
  company_id?: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  industry?: string | null;
  subcategory?: string | null;
  resources_offered?: string | null;
  resources_sought?: string | null;
  capacity_details?: string | null;
  preferred_contact?: string;
  logo_name?: string | null;
  image_name?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  notes?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
