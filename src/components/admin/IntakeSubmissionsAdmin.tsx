"use client";

import { useMemo, useState } from "react";
import {
  deleteSubmission,
  updateSubmission,
  updateSubmissionNote,
  updateSubmissionStatus,
  type IntakeSubmission,
  type SubmissionStatus,
} from "@/lib/intakeSubmissions";
import {
  mergeFormConfig,
  type IntakeFormConfigPayload,
  type IntakeFormFieldConfig,
} from "@/lib/intakeFormConfig";
import { submissionToDbRow } from "@/lib/intakeTypes";

const actionBtn =
  "text-[11px] font-medium px-1.5 py-0.5 rounded border transition-colors disabled:opacity-40";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    reviewed: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    archived: "bg-gray-100 text-gray-500 border-gray-200",
    converted: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const labels: Record<SubmissionStatus, string> = {
    new: "New",
    reviewed: "Reviewed",
    approved: "Approved",
    archived: "Archived",
    converted: "Converted",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

async function postAction(body: Record<string, unknown>) {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch {
    return { ok: false };
  }
}

interface Props {
  submissions: IntakeSubmission[];
  supabaseLive: boolean;
  onMessage: (msg: string) => void;
}

export default function IntakeSubmissionsAdmin({ submissions, supabaseLive, onMessage }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [editing, setEditing] = useState<IntakeSubmission | null>(null);
  const [showFormConfig, setShowFormConfig] = useState(false);
  const [formConfig, setFormConfig] = useState<IntakeFormConfigPayload>(mergeFormConfig(null));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      return [s.companyName, s.contactName, s.email, s.industry, s.listingTitle, s.resourcesOffered]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [submissions, search, statusFilter]);

  const loadFormConfig = () => {
    void fetch("/api/admin/intake-config")
      .then((r) => r.json())
      .then((j) => setFormConfig(mergeFormConfig(j.config ?? null)))
      .catch(() => {});
  };

  const saveFormConfig = () => {
    void fetch("/api/admin/intake-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: formConfig }),
    }).then(() => onMessage("Form configuration saved."));
  };

  const setStatus = (id: string, status: SubmissionStatus) => {
    updateSubmissionStatus(id, status);
    if (supabaseLive) void postAction({ entity: "intake", action: "status", id, status });
  };

  const approve = (id: string) => {
    updateSubmissionStatus(id, "approved");
    if (supabaseLive) void postAction({ entity: "intake", action: "approve", id });
  };

  const convert = (id: string) => {
    if (supabaseLive) {
      void postAction({ entity: "intake", action: "convert", id }).then((r) => {
        onMessage(r?.ok ? "Created company profile + listing(s) from submission." : r?.error ?? "Convert failed.");
        if (r?.ok) updateSubmissionStatus(id, "converted");
      });
    } else {
      onMessage("Connect Supabase to convert submissions.");
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    updateSubmission(editing.id, editing);
    if (supabaseLive) {
      void postAction({
        entity: "intake",
        action: "update",
        id: editing.id,
        patch: submissionToDbRow(editing),
      });
    }
    onMessage("Submission updated.");
    setEditing(null);
  };

  const toggleField = (id: string, key: "visible" | "required") => {
    setFormConfig((cfg) => ({
      fields: cfg.fields.map((f) => (f.id === id ? { ...f, [key]: !f[key] } : f)),
    }));
  };

  const moveField = (id: string, direction: -1 | 1) => {
    setFormConfig((cfg) => {
      const sorted = [...cfg.fields].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((f) => f.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sorted.length) return cfg;
      const next = [...sorted];
      [next[index], next[target]] = [next[target], next[index]];
      return {
        fields: next.map((f, i) => ({ ...f, order: i + 1 })),
      };
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Intake Submissions ({submissions.length})</h2>
          <p className="text-[11px] text-gray-400">Early access at /intake · /join · /founding-companies</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowFormConfig((v) => !v);
            if (!showFormConfig) loadFormConfig();
          }}
          className="text-[12px] px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
        >
          {showFormConfig ? "Hide Form Settings" : "Edit Form Fields"}
        </button>
      </div>

      {showFormConfig && (
        <div className="bg-white border border-gray-200 rounded p-4 space-y-2">
          <p className="text-xs text-gray-500 mb-2">Toggle visibility and required flags without code changes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {formConfig.fields
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((f: IntakeFormFieldConfig) => (
              <div key={f.id} className="flex items-center justify-between gap-2 text-[12px] border border-gray-100 rounded px-2 py-1.5">
                <span className="truncate">{f.label}</span>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => moveField(f.id, -1)} className="px-1 py-0.5 rounded border border-gray-200 text-[10px]" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => moveField(f.id, 1)} className="px-1 py-0.5 rounded border border-gray-200 text-[10px]" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => toggleField(f.id, "visible")} className={`px-1.5 py-0.5 rounded border text-[10px] ${f.visible ? "bg-blue-50 border-blue-200" : "border-gray-200"}`}>Show</button>
                  <button type="button" onClick={() => toggleField(f.id, "required")} className={`px-1.5 py-0.5 rounded border text-[10px] ${f.required ? "bg-green-50 border-green-200" : "border-gray-200"}`}>Req</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={saveFormConfig} className="text-[12px] px-3 py-1.5 bg-blue-700 text-white rounded">
            Save Form Configuration
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, email, industry..."
          className="flex-1 px-3 py-1.5 text-[13px] border border-gray-300 rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")}
          className="px-3 py-1.5 text-[13px] border border-gray-300 rounded bg-white"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="converted">Converted</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-[11px] uppercase px-3 py-2 text-gray-500">Company</th>
              <th className="text-left text-[11px] uppercase px-3 py-2 text-gray-500">Listing</th>
              <th className="text-left text-[11px] uppercase px-3 py-2 text-gray-500">Purpose</th>
              <th className="text-left text-[11px] uppercase px-3 py-2 text-gray-500">Status</th>
              <th className="text-right text-[11px] uppercase px-3 py-2 text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/60 align-top">
                <td className="px-3 py-2 text-[13px]">
                  <div className="font-medium text-gray-900">{s.companyName}</div>
                  <div className="text-[11px] text-gray-400">{s.contactName} · {s.email}</div>
                  <div className="text-[11px] text-gray-400">{s.location}</div>
                </td>
                <td className="px-3 py-2 text-[13px] max-w-[220px]">
                  <div className="font-medium truncate">{s.listingTitle || "—"}</div>
                  <div className="text-[11px] text-gray-500 line-clamp-2">{s.listingDescription || s.resourcesOffered}</div>
                </td>
                <td className="px-3 py-2 text-[12px] capitalize">{s.purpose || "—"}</td>
                <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <div className="inline-flex flex-wrap justify-end gap-1">
                    <button type="button" onClick={() => setEditing({ ...s })} className={`${actionBtn} border-gray-300`}>Edit</button>
                    <button type="button" onClick={() => approve(s.id)} className={`${actionBtn} border-green-300 text-green-700`}>Approve</button>
                    <button type="button" onClick={() => convert(s.id)} className={`${actionBtn} border-blue-300 text-blue-700`}>Convert To Company</button>
                    <button type="button" onClick={() => setStatus(s.id, "archived")} className={`${actionBtn} border-gray-300`}>Archive</button>
                    <button type="button" onClick={() => { deleteSubmission(s.id); if (supabaseLive) void postAction({ entity: "intake", action: "delete", id: s.id }); }} className={`${actionBtn} border-red-300 text-red-700`}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No submissions match your filters.</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-4">
            <h3 className="text-sm font-bold mb-3">Edit Submission</h3>
            <div className="space-y-2">
              {(["companyName", "contactName", "email", "location", "industry", "listingTitle", "listingDescription", "resourcesOffered", "resourcesSought"] as const).map((key) => (
                <label key={key} className="block text-xs text-gray-500">
                  {key}
                  <input
                    className="w-full mt-0.5 px-2 py-1 text-[13px] border border-gray-300 rounded"
                    value={String(editing[key] ?? "")}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-xs text-gray-500">
                Admin note
                <textarea
                  className="w-full mt-0.5 px-2 py-1 text-[13px] border border-gray-300 rounded"
                  rows={2}
                  value={editing.adminNote ?? ""}
                  onChange={(e) => setEditing({ ...editing, adminNote: e.target.value })}
                  onBlur={() => {
                    updateSubmissionNote(editing.id, editing.adminNote ?? "");
                    if (supabaseLive) void postAction({ entity: "intake", action: "note", id: editing.id, note: editing.adminNote ?? "" });
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2 border border-gray-300 rounded text-sm">Cancel</button>
              <button type="button" onClick={saveEdit} className="flex-1 py-2 bg-blue-700 text-white rounded text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
