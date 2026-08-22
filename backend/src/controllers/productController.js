import Product from "../models/Product.js";
import Version from "../models/Version.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { extractAndEnrichProduct, revalidateField } from "../services/geminiService.js";

const FIELD_KEYS = [
  "title", "brand", "category", "description",
  "material", "dimensions", "certifications", "price", "keywords",
];

const computeQualityScore = (aiFields) => {
  const scores = FIELD_KEYS.map((k) => aiFields[k]?.confidence ?? 0);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const saveVersion = async (product, changeSummary, createdBy) => {
  const nextVersion = product.currentVersion;
  await Version.create({
    product: product._id,
    versionNumber: nextVersion,
    snapshot: product.toObject(),
    changeSummary,
    createdBy,
  });
};

// POST /api/products/ingest/text
export const ingestText = async (req, res) => {
  const { rawText } = req.body;
  const aiFields = await extractAndEnrichProduct(rawText);

  const product = await Product.create({
    owner: req.user.id,
    sourceType: "text",
    rawTextSnapshot: rawText,
    ...aiFields,
    overallQualityScore: computeQualityScore(aiFields),
    status: "needs_review",
    currentVersion: 1,
  });

  await saveVersion(product, "Initial AI extraction", "ai");
  res.status(201).json(product);
};

// POST /api/products/ingest/pdf   (multipart, field name "file")
export const ingestPDF = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "PDF file is required" });

  const { text, likelyScanned } = await extractTextFromPDF(req.file.buffer);
  if (likelyScanned || text.length < 20) {
    return res.status(422).json({
      message: "This PDF appears to be scanned/image-only. No extractable text was found. Please upload a text-based PDF or use OCR.",
    });
  }

  const aiFields = await extractAndEnrichProduct(text);

  const product = await Product.create({
    owner: req.user.id,
    sourceType: "pdf",
    rawTextSnapshot: text,
    ...aiFields,
    overallQualityScore: computeQualityScore(aiFields),
    status: "needs_review",
    currentVersion: 1,
  });

  await saveVersion(product, "Initial AI extraction from PDF", "ai");
  res.status(201).json(product);
};

// GET /api/products
export const listProducts = async (req, res) => {
  const products = await Product.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(products);
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

// PATCH /api/products/:id/field   { fieldName, value }  -- manual reviewer correction
export const updateField = async (req, res) => {
  const { fieldName, value } = req.body;
  if (!FIELD_KEYS.includes(fieldName)) return res.status(400).json({ message: "Invalid field" });

  const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
  if (!product) return res.status(404).json({ message: "Not found" });

  product[fieldName] = {
    value,
    source: "manual",
    confidence: 100,
    evidence: "Manually corrected by reviewer",
    reviewed: true,
  };
  product.overallQualityScore = computeQualityScore(product.toObject());
  product.currentVersion += 1;
  await product.save();

  await saveVersion(product, `Reviewer manually edited "${fieldName}"`, "reviewer");
  res.json(product);
};

// PATCH /api/products/:id/approve  { fieldNames: [] }  -- mark AI fields as reviewed/approved
export const approveFields = async (req, res) => {
  const { fieldNames } = req.body;
  const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
  if (!product) return res.status(404).json({ message: "Not found" });

  fieldNames.forEach((f) => {
    if (product[f]) product[f].reviewed = true;
  });

  const allReviewed = FIELD_KEYS.every((k) => product[k]?.reviewed);
  product.status = allReviewed ? "approved" : "needs_review";
  product.currentVersion += 1;
  await product.save();

  await saveVersion(product, `Reviewer approved fields: ${fieldNames.join(", ")}`, "reviewer");
  res.json(product);
};

// POST /api/products/:id/revalidate  { fieldName }  -- ask Gemini to double-check a field
export const revalidate = async (req, res) => {
  const { fieldName } = req.body;
  const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
  if (!product) return res.status(404).json({ message: "Not found" });

  const result = await revalidateField(fieldName, product[fieldName]?.value, product.rawTextSnapshot);
  res.json(result);
};

// GET /api/products/:id/versions
export const getVersions = async (req, res) => {
  const versions = await Version.find({ product: req.params.id }).sort({ versionNumber: 1 });
  res.json(versions);
};

// GET /api/products/:id/diff?from=1&to=2
export const diffVersions = async (req, res) => {
  const { from, to } = req.query;
  const versions = await Version.find({
    product: req.params.id,
    versionNumber: { $in: [Number(from), Number(to)] },
  });
  if (versions.length !== 2) return res.status(404).json({ message: "Versions not found" });

  const [v1, v2] = versions.sort((a, b) => a.versionNumber - b.versionNumber);
  const diff = {};
  FIELD_KEYS.forEach((key) => {
    const before = v1.snapshot[key]?.value;
    const after = v2.snapshot[key]?.value;
    if (before !== after) diff[key] = { before, after };
  });

  res.json({ from: v1.versionNumber, to: v2.versionNumber, diff });
};
