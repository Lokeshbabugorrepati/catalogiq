export default function ConfidenceBadge({ confidence, source }) {
  const styles =
    source === "verified" ? "bg-verified-soft text-verified border-verified/20" :
    source === "manual" ? "bg-cobalt-soft text-cobalt border-cobalt/20" :
    confidence >= 50 ? "bg-inferred-soft text-inferred border-inferred/20" :
    "bg-risk-soft text-risk border-risk/20";

  const sourceLabel =
    source === "verified" ? "Verified" :
    source === "manual" ? "Manual" :
    "AI inferred";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {sourceLabel} · {confidence}%
    </span>
  );
}
