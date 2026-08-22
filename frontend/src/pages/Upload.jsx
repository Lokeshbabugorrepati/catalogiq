import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Upload() {
  const [mode, setMode] = useState("pdf"); // "pdf" | "text"
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
    else setError("Only PDF files are supported here.");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "pdf") {
        if (!file) throw new Error("Choose a PDF file first");
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/products/ingest/pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data = res.data;
      } else {
        if (rawText.trim().length < 20) throw new Error("Paste at least a short paragraph of product text");
        const res = await api.post("/products/ingest/text", { rawText });
        data = res.data;
      }
      navigate(`/products/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Ingestion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <p className="text-xs font-mono uppercase tracking-widest text-cobalt mb-1">Ingestion</p>
      <h1 className="font-display text-2xl font-semibold text-ink">Bring product data into CatalogIQ</h1>
      <p className="text-sm text-slate-500 mt-1">
        Start with whatever information you have. CatalogIQ extracts, validates, and enriches it into a structured record.
      </p>

      {/* mode switch */}
      <div className="mt-6 inline-flex rounded-lg border border-steel bg-surface p-1">
        <button
          onClick={() => setMode("pdf")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
            mode === "pdf" ? "bg-ink text-white" : "text-slate-500"
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setMode("text")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
            mode === "text" ? "bg-ink text-white" : "text-slate-500"
          }`}
        >
          Paste raw text
        </button>
      </div>

      <div className="mt-6 bg-surface border border-steel rounded-xl shadow-card p-6">
        {mode === "pdf" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
              dragging ? "border-cobalt bg-cobalt-soft" : "border-steel"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="font-display font-medium text-ink">
              {file ? file.name : "Drag and drop a spec sheet here"}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">PDF only · up to 5MB</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-lg border border-steel px-4 py-2 text-sm font-medium hover:bg-canvas transition"
            >
              Browse files
            </button>
          </div>
        ) : (
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Paste product description, spec text, or catalog copy here..."
            className="w-full rounded-lg border border-steel px-3 py-2.5 text-sm font-mono outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition resize-none"
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-risk bg-risk-soft border border-risk/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono">
            Pipeline: Ingest → Extract → Normalize → Validate → Enrich → Review
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-cobalt text-white text-sm font-medium px-5 py-2.5 hover:bg-cobalt-dark transition disabled:opacity-60"
          >
            {loading ? "Processing with AI..." : "Run AI Cataloging"}
          </button>
        </div>
      </div>
    </div>
  );
}
