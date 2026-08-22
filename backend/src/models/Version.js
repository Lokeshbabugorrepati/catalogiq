import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true }, // full product field state at this point
    changeSummary: { type: String, default: "" }, // e.g. "AI extraction" / "Reviewer approved 4 fields" / "Manual edit: material"
    createdBy: { type: String, enum: ["ai", "reviewer"], default: "ai" },
  },
  { timestamps: true }
);

export default mongoose.model("Version", versionSchema);
