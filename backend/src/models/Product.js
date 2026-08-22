import mongoose from "mongoose";

// Every extracted/enriched attribute is stored as an object, not a raw value,
// so the UI can always show WHY the value is what it is (explainability).
const fieldSchema = new mongoose.Schema(
  {
    value: mongoose.Schema.Types.Mixed,
    source: { type: String, enum: ["verified", "ai_inferred", "manual"], default: "ai_inferred" },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    evidence: { type: String, default: "" }, // e.g. "Extracted from spec sheet, page 2: '...material: SS304...'"
    reviewed: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sourceType: { type: String, enum: ["pdf", "text", "url", "csv"], required: true },
    rawTextSnapshot: { type: String }, // original extracted text, kept for audit trail

    // Structured, explainable attribute set
    title: fieldSchema,
    brand: fieldSchema,
    category: fieldSchema,
    description: fieldSchema,
    material: fieldSchema,
    dimensions: fieldSchema,
    certifications: fieldSchema,
    price: fieldSchema,
    keywords: fieldSchema,

    overallQualityScore: { type: Number, min: 0, max: 100, default: 0 },
    currentVersion: { type: Number, default: 1 },
    status: { type: String, enum: ["processing", "needs_review", "approved"], default: "processing" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
