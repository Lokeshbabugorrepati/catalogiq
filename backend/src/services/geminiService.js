import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Every field the model returns MUST include value + confidence + evidence.
// This is what makes the output "trustworthy" instead of a black box.
const PRODUCT_SCHEMA_INSTRUCTION = `
Return ONLY valid JSON matching this exact shape (no markdown, no commentary):
{
  "title":        { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "brand":        { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "category":     { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "description":  { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "material":     { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "dimensions":   { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "certifications": { "value": string, "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "price":        { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string },
  "keywords":     { "value": string,  "source": "verified"|"ai_inferred", "confidence": number, "evidence": string }
}

Rules:
- "source": "verified" ONLY if the value is directly and explicitly stated in the input text.
- "source": "ai_inferred" if you filled a gap using general product-category knowledge (missing info).
- "confidence": 0-100. Use 90-100 only for text copied/paraphrased directly from source. Use 40-70 for reasonable inference. Use below 40 if you are guessing.
- "evidence": ALWAYS explain in one short sentence WHY you chose this value - quote the exact phrase from the source if verified, or state the reasoning/category logic if inferred (e.g. "Inferred: HVAC valves of this type typically use brass").
- Never leave "evidence" empty. Never fabricate a source quote that isn't in the text.
- If a value truly cannot be determined or inferred, set value to "Unknown", source to "ai_inferred", confidence to 0, and explain why in evidence.
`;

export async function extractAndEnrichProduct(rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `
You are an industrial product data specialist for a B2B commerce platform (verticals: HVAC, plumbing, PVF, electrical, industrial supply).
Given the raw product text below, extract structured attributes. If an attribute is missing from the text, use category-aware
reasoning to infer a plausible value instead of leaving it blank, but be honest about confidence and mark it as ai_inferred.

${PRODUCT_SCHEMA_INSTRUCTION}

RAW PRODUCT TEXT:
"""
${rawText.slice(0, 12000)}
"""
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Gemini returned malformed JSON: " + err.message);
  }
}

// Re-validate an already-extracted field against the original source text.
// Used when a reviewer wants an AI "second opinion" before approving a field.
export async function revalidateField(fieldName, currentValue, rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `
Check whether the value below for the field "${fieldName}" is actually supported by the source text.
Value to check: "${currentValue}"

Source text:
"""
${rawText.slice(0, 8000)}
"""

Return ONLY JSON: { "isSupported": boolean, "confidence": number, "explanation": string, "suggestedCorrection": string|null }

Rules:
- "confidence" MUST be an integer from 0 to 100 (never a decimal fraction like 0.95 - use 95 instead).
- "isSupported" MUST be consistent with "confidence": if confidence is 70 or above, isSupported MUST be true. If confidence is below 70, isSupported MUST be false.
- "explanation" MUST agree with "isSupported" - do not write an explanation confirming the value is correct while marking isSupported as false, or vice versa.
- "suggestedCorrection" should only be non-null when isSupported is false.
`;
  const result = await model.generateContent(prompt);
  const cleaned = result.response.text().trim().replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Duplicate/near-duplicate detection using Gemini's semantic judgement
// (lighter-weight alternative to a full embeddings + vector DB setup for a hackathon MVP)
export async function checkDuplicate(productA, productB) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `
Are these two industrial product records describing the SAME physical product (just different naming/formatting)?
Product A: ${JSON.stringify(productA)}
Product B: ${JSON.stringify(productB)}
Return ONLY JSON: { "isDuplicate": boolean, "confidence": number, "reason": string }
`;
  const result = await model.generateContent(prompt);
  const cleaned = result.response.text().trim().replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
