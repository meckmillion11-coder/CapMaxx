/** Admin-editable intake form configuration (stored in intake_form_config.config). */

export type IntakeFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "purpose";

export interface IntakeFormFieldConfig {
  id: string;
  label: string;
  type: IntakeFieldType;
  section: string;
  required: boolean;
  visible: boolean;
  order: number;
  placeholder?: string;
  hint?: string;
  options?: string[];
}

export const RESOURCE_CATEGORIES = [
  "Manufacturing Capacity",
  "Warehouse Space",
  "Transportation Capacity",
  "Equipment",
  "Skilled Labor",
  "Manufacturing Capability",
  "Professional Services",
  "Distribution Network",
  "Other",
] as const;

export const PURPOSE_OPTIONS = [
  { value: "offer", label: "I Want To Offer Resources" },
  { value: "need", label: "I Want To Find Resources" },
  { value: "both", label: "Both" },
] as const;

export type IntakePurpose = "offer" | "need" | "both";

export const DEFAULT_INTAKE_FORM_FIELDS: IntakeFormFieldConfig[] = [
  { id: "companyName", label: "Company Name", type: "text", section: "company", required: true, visible: true, order: 1, placeholder: "Acme Manufacturing Co." },
  { id: "contactName", label: "Contact Name", type: "text", section: "company", required: true, visible: true, order: 2, placeholder: "Jane Doe" },
  { id: "email", label: "Email", type: "email", section: "company", required: true, visible: true, order: 3 },
  { id: "phone", label: "Phone", type: "tel", section: "company", required: false, visible: true, order: 4 },
  { id: "website", label: "Website", type: "url", section: "company", required: false, visible: true, order: 5 },
  { id: "location", label: "Location", type: "text", section: "company", required: true, visible: true, order: 6, placeholder: "City, State/Province, Country" },
  { id: "industry", label: "Industry", type: "select", section: "company", required: true, visible: true, order: 7 },
  { id: "purpose", label: "Purpose", type: "purpose", section: "purpose", required: true, visible: true, order: 10 },
  { id: "listingTitle", label: "Listing Title", type: "text", section: "listing", required: true, visible: true, order: 11, placeholder: "CNC Machining Capacity Available" },
  { id: "listingDescription", label: "Description", type: "textarea", section: "listing", required: true, visible: true, order: 12, placeholder: "Brief summary of your opportunity or resource" },
  { id: "resourceCategories", label: "Resource Categories", type: "multiselect", section: "listing", required: false, visible: true, order: 13, options: [...RESOURCE_CATEGORIES] },
  { id: "resourcesOffered", label: "What Do You Offer?", type: "textarea", section: "resources", required: false, visible: true, order: 20, hint: "Resources, capabilities, services, capacity, equipment, warehouse space, transportation, etc." },
  { id: "resourcesSought", label: "What Are You Looking For?", type: "textarea", section: "resources", required: false, visible: true, order: 21, hint: "Partners, manufacturing, warehousing, logistics, labor, or opportunities you need" },
  { id: "moq", label: "Minimum Order Quantity (MOQ)", type: "text", section: "advanced", required: false, visible: true, order: 30 },
  { id: "leadTime", label: "Lead Time", type: "text", section: "advanced", required: false, visible: true, order: 31 },
  { id: "certifications", label: "Certifications", type: "text", section: "advanced", required: false, visible: true, order: 32 },
  { id: "teamSize", label: "Team Size", type: "text", section: "advanced", required: false, visible: true, order: 33 },
  { id: "capacityInfo", label: "Capacity Information", type: "textarea", section: "advanced", required: false, visible: true, order: 34 },
  { id: "serviceArea", label: "Service Area", type: "text", section: "advanced", required: false, visible: true, order: 35 },
  { id: "equipmentDetails", label: "Equipment Details", type: "textarea", section: "advanced", required: false, visible: true, order: 36 },
  { id: "industriesServed", label: "Industries Served", type: "text", section: "advanced", required: false, visible: true, order: 37, hint: "Comma-separated" },
  { id: "availabilityNotes", label: "Availability Notes", type: "textarea", section: "advanced", required: false, visible: true, order: 38, hint: "e.g. Available every Friday, idle capacity last week of each month" },
  { id: "photos", label: "Photos", type: "text", section: "advanced", required: false, visible: true, order: 39 },
  { id: "videos", label: "Video Links", type: "text", section: "advanced", required: false, visible: true, order: 40, hint: "YouTube or video URLs, one per line" },
  { id: "additionalNotes", label: "Additional Notes", type: "textarea", section: "advanced", required: false, visible: true, order: 41 },
];

export interface IntakeFormConfigPayload {
  fields: IntakeFormFieldConfig[];
}

export function mergeFormConfig(stored: Partial<IntakeFormConfigPayload> | null): IntakeFormConfigPayload {
  const defaults = DEFAULT_INTAKE_FORM_FIELDS;
  if (!stored?.fields?.length) return { fields: defaults };

  const byId = new Map(stored.fields.map((f) => [f.id, f]));
  const merged = defaults.map((d) => ({ ...d, ...byId.get(d.id) }));
  stored.fields.forEach((f) => {
    if (!merged.some((m) => m.id === f.id)) merged.push(f);
  });
  return { fields: merged.sort((a, b) => a.order - b.order) };
}

export function visibleFields(config: IntakeFormConfigPayload, section?: string) {
  return config.fields.filter((f) => f.visible && (!section || f.section === section));
}
