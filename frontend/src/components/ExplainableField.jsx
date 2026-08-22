import { useState } from "react";
import ConfidenceBadge from "./ConfidenceBadge";

export default function ExplainableField({ label, field, onSave, onApprove, onRevalidate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field?.value ?? "");
  const [showEvidence, setShowEvidence] = useState(false);

  if (!field) return null;

  return (
    <div className="rounded-xl border border-steel bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-widest text-steel-dim text-[#9AA3B2]">{label}</p>
          {editing ? (
            <input
              className="mt-1.5 w-full rounded-md border border-steel px-2 py-1.5 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            <p className="mt-1.5 text-sm font-medium font-mono text-ink truncate">{field.value}</p>
          )}
        </div>
        <ConfidenceBadge confidence={field.confidence} source={field.source} />
      </div>

      <button
        onClick={() => setShowEvidence((s) => !s)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-cobalt hover:underline"
      >
        <svg width="10" height="12" viewBox="0 0 10 12" className="shrink-0">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
          <path d="M1,1 C1,6 4,6 4,11" className="leader-line" stroke="currentColor" />
          <circle cx="4" cy="11" r="1" fill="currentColor" />
        </svg>
        {showEvidence ? "Hide reasoning" : "Why this value?"}
      </button>

      {showEvidence && (
        <div className="mt-2 rounded-lg bg-canvas border border-steel p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-steel-dim text-[#9AA3B2] mb-1">Evidence</p>
          <p className="text-xs text-slate-600 leading-relaxed">{field.evidence}</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} className="text-xs rounded-md border border-steel px-2.5 py-1.5 hover:bg-canvas transition">
              Edit
            </button>
            <button onClick={() => onApprove(label)} className="text-xs rounded-md bg-ink text-white px-2.5 py-1.5 hover:bg-cobalt transition">
              Approve
            </button>
            <button onClick={() => onRevalidate(label)} className="text-xs rounded-md border border-steel px-2.5 py-1.5 hover:bg-canvas transition">
              Re-check with AI
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { onSave(label, draft); setEditing(false); }}
              className="text-xs rounded-md bg-verified text-white px-2.5 py-1.5"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs rounded-md border border-steel px-2.5 py-1.5">
              Cancel
            </button>
          </>
        )}
      </div>

      {field.reviewed && (
        <p className="mt-2 text-[11px] font-mono text-verified">✓ Reviewed & approved</p>
      )}
    </div>
  );
}
