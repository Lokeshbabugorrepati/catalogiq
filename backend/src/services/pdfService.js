import pdfParse from "pdf-parse";

// Extracts text from a PDF buffer. Detects likely scanned/image-only PDFs
// (very little extractable text despite having pages) so the frontend can warn the user.
export async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text.trim();

  const avgCharsPerPage = data.numpages > 0 ? text.length / data.numpages : 0;
  const likelyScanned = avgCharsPerPage < 30; // heuristic threshold

  return {
    text,
    numPages: data.numpages,
    likelyScanned,
  };
}
