import { useEffect, useState } from "react";
import api from "../api/axios";

const FIELD_KEYS = ["title","brand","category","description","material","dimensions","certifications","price","keywords"];

export default function Insights() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data)).catch(() => setProducts([]));
  }, []);

  if (!products) return <div className="p-8 text-sm text-slate-500 font-mono">Loading insights...</div>;

  const total = products.length;
  const avg = total ? Math.round(products.reduce((s, p) => s + (p.overallQualityScore || 0), 0) / total) : 0;
  const best = total ? Math.max(...products.map((p) => p.overallQualityScore || 0)) : 0;

  // per-field average confidence, to find weakest recurring attribute
  const fieldAverages = FIELD_KEYS.map((key) => {
    const vals = products.map((p) => p[key]?.confidence).filter((v) => v !== undefined);
    const avgConf = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const inferredCount = products.filter((p) => p[key]?.source === "ai_inferred").length;
    return { key, avgConf, inferredCount };
  }).sort((a, b) => a.avgConf - b.avgConf);

  const weakestFields = fieldAverages.slice(0, 4);
  const mostEnrichedFields = [...fieldAverages].sort((a, b) => b.inferredCount - a.inferredCount).slice(0, 4);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <p className="text-xs font-mono uppercase tracking-widest text-cobalt mb-1">Insights</p>
      <h1 className="font-display text-2xl font-semibold text-ink">Catalog quality insights</h1>
      <p className="text-sm text-slate-500 mt-1">Where AI is confident, where it's guessing, and what needs attention.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Stat label="Products in Catalog" value={total} />
        <Stat label="Average Quality Score" value={`${avg}%`} />
        <Stat label="Best Quality Score" value={`${best}%`} />
        <Stat label="Fields Tracked" value={FIELD_KEYS.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Panel title="Most Recurring Weak Fields" subtitle="Lowest average confidence across the catalog">
          {weakestFields.map((f) => (
            <FieldBar key={f.key} label={f.key} value={f.avgConf} tone="risk" />
          ))}
        </Panel>

        <Panel title="Most AI-Enriched Fields" subtitle="Fields most often filled in by inference rather than source text">
          {mostEnrichedFields.map((f) => (
            <FieldBar key={f.key} label={f.key} value={f.inferredCount} suffix=" products" tone="inferred" />
          ))}
        </Panel>
      </div>

      <Panel title="Per-Product Performance" subtitle="Quality score and review status for every ingested product" className="mt-6">
        <div className="divide-y divide-steel">
          {products.length === 0 && (
            <p className="text-sm text-slate-500 py-6 text-center">No products ingested yet.</p>
          )}
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.title?.value || "Untitled"}</p>
                <p className="text-xs text-slate-500 font-mono">{p.status}</p>
              </div>
              <span className="text-sm font-mono font-medium text-ink">{p.overallQualityScore}%</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface border border-steel rounded-xl shadow-card p-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-surface border border-steel rounded-xl shadow-card p-5 ${className}`}>
      <h2 className="font-display font-semibold text-ink">{title}</h2>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function FieldBar({ label, value, suffix = "%", tone }) {
  const barColor = tone === "risk" ? "bg-risk" : "bg-inferred";
  const width = tone === "risk" ? value : Math.min(100, value * 15);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-mono capitalize text-slate-600">{label}</span>
        <span className="font-mono text-slate-500">{value}{suffix}</span>
      </div>
      <div className="h-1.5 rounded-full bg-canvas overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
