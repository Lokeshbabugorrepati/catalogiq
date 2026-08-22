import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String }, // optional now - Google-signup users won't have one
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["reviewer", "admin"], default: "reviewer" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
