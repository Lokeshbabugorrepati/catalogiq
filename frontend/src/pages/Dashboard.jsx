import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ConfidenceBadge from "../components/ConfidenceBadge";

const FIELD_KEYS = ["title","brand","category","description","material","dimensions","certifications","price","keywords"];

export default function Dashboard() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data)).catch(() => setProducts([]));
  }, []);

  if (!products) {
    return <div className="p-8 text-sm text-slate-500 font-mono">Loading catalog...</div>;
  }

  const total = products.length;
  const avgQuality = total
    ? Math.round(products.reduce((sum, p) => sum + (p.overallQualityScore || 0), 0) / total)
    : 0;
  const needsReview = products.filter((p) => p.status === "needs_review").length;
  const approved = products.filter((p) => p.status === "approved").length;

  // lowest-confidence field per product, for the review queue
  const reviewQueue = products
    .filter((p) => p.status !== "approved")
    .map((p) => {
      const weakest = FIELD_KEYS
        .map((k) => ({ key: k, ...p[k] }))
        .filter((f) => f.value !== undefined)
        .sort((a, b) => a.confidence - b.confidence)[0];
      return { product: p, weakest };
    })
    .sort((a, b) => (a.weakest?.confidence ?? 0) - (b.weakest?.confidence ?? 0))
    .slice(0, 6);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-cobalt mb-1">Product Data Intelligence</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor catalog quality, AI enrichment, and review activity.</p>
        </div>
        <Link
          to="/upload"
          className="rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-cobalt transition"
        >
          + Ingest Products
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Products Processed" value={total} />
        <KpiCard label="Avg. Confidence" value={`${avgQuality}%`} accent={avgQuality >= 80 ? "verified" : avgQuality >= 50 ? "inferred" : "risk"} />
        <KpiCard label="Needs Human Review" value={needsReview} accent="inferred" />
        <KpiCard label="Approved" value={approved} accent="verified" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review queue */}
        <div className="lg:col-span-2 bg-surface border border-steel rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink">Review Queue</h2>
            <span className="text-xs font-mono text-slate-400">{reviewQueue.length} items</span>
          </div>

          {reviewQueue.length === 0 ? (
            <EmptyState
              title="Nothing waiting on review"
              body="Upload a spec sheet or paste product text to start building your catalog."
              actionLabel="Ingest a product"
              actionTo="/upload"
            />
          ) : (
            <div className="divide-y divide-steel">
              {reviewQueue.map(({ product, weakest }) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="flex items-center justify-between py-3 hover:bg-canvas -mx-2 px-2 rounded-lg transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{product.title?.value || "Untitled product"}</p>
                    <p className="text-xs text-slate-500 font-mono">{product.category?.value || "Uncategorized"}</p>
                  </div>
                  {weakest && <ConfidenceBadge confidence={weakest.confidence} source={weakest.source} />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Processing pipeline snapshot */}
        <div className="bg-surface border border-steel rounded-xl shadow-card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Pipeline</h2>
          <PipelineStep label="Ingestion" sub="PDF, text, URL" done />
          <PipelineStep label="Extraction" sub="Gemini structured parse" done />
          <PipelineStep label="Normalization" sub="Units & taxonomy" done />
          <PipelineStep label="Validation" sub="Confidence scoring" done />
          <PipelineStep label="Human Review" sub={`${needsReview} pending`} active={needsReview > 0} />
          <PipelineStep label="Catalog" sub={`${approved} published`} last />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  const dot =
    accent === "verified" ? "bg-verified" : accent === "inferred" ? "bg-inferred" : accent === "risk" ? "bg-risk" : "bg-cobalt";
  return (
    <div className="bg-surface border border-steel rounded-xl shadow-card p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function PipelineStep({ label, sub, done, active, last }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            done ? "bg-verified" : active ? "bg-inferred" : "bg-steel"
          }`}
        />
        {!last && <span className="w-px flex-1 bg-steel my-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-slate-500 font-mono">{sub}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, body, actionLabel, actionTo }) {
  return (
    <div className="text-center py-10">
      <p className="font-display font-medium text-ink">{title}</p>
      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{body}</p>
      <Link to={actionTo} className="inline-block mt-4 text-sm font-medium text-cobalt hover:underline">
        {actionLabel} →
      </Link>
    </div>
  );
}
