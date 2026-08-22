import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/upload.js";
import { aiRateLimiter } from "../middleware/rateLimit.js";
import { validate, textIngestSchema } from "../utils/schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ingestText, ingestPDF, listProducts, getProduct,
  updateField, approveFields, revalidate, getVersions, diffVersions,
} from "../controllers/productController.js";

const router = Router();
router.use(protect);

router.post("/ingest/text", aiRateLimiter, validate(textIngestSchema), asyncHandler(ingestText));
router.post("/ingest/pdf", aiRateLimiter, uploadPDF.single("file"), asyncHandler(ingestPDF));

router.get("/", asyncHandler(listProducts));
router.get("/:id", asyncHandler(getProduct));
router.patch("/:id/field", asyncHandler(updateField));
router.patch("/:id/approve", asyncHandler(approveFields));
router.post("/:id/revalidate", aiRateLimiter, asyncHandler(revalidate));
router.get("/:id/versions", asyncHandler(getVersions));
router.get("/:id/diff", asyncHandler(diffVersions));

export default router;
