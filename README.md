# CatalogIQ

**AI-Powered Product Data Intelligence for Industrial B2B Commerce**

Built for **UniHack** — an AI innovation hackathon hosted by **Unilog** in partnership with **Hack2Skill (H2S)**, focused on building prototype solutions for Unilog's product content and commerce challenges.

---

## 1. The Problem

Industrial and B2B distributors (HVAC, plumbing, PVF, electrical, industrial supply) manage huge volumes of product information scattered across websites, PDF catalogs, and technical spec sheets. Converting this fragmented, inconsistent data into accurate, structured, commerce-ready product records is slow, manual, and error-prone — and existing AI tools that "auto-fill" product data are black boxes: you can't tell what the AI actually knew versus what it guessed.

**UniHack's challenge statement:** build an AI-powered solution that transforms limited product information into rich, reliable, commerce-ready product intelligence — focused on **data enrichment, validation, and explainable outputs**.

## 2. Our Solution

CatalogIQ is an end-to-end pipeline that takes raw, messy product input (a spec sheet PDF or plain text) and turns it into a structured, confidence-scored, and — critically — **explainable** product record. Every single field CatalogIQ produces answers three questions at once:

1. **What is the value?** (e.g. Material: Forged Brass)
2. **How confident are we?** (a 0–100% score)
3. **Why do we believe this?** (a direct quote from the source document, or an honest admission that the AI is inferring based on category knowledge)

This is the core differentiator: instead of a black-box AI that silently guesses, CatalogIQ visually and textually distinguishes **"verified from source"** vs **"AI-inferred"** vs **"manually corrected"** for every field, with a human reviewer able to approve, edit, or challenge the AI's answer before it's trusted.

## 3. Key Features

- **Multi-source ingestion** — upload a PDF spec sheet or paste raw product text
- **AI structured extraction** — Google Gemini parses unstructured input into 9 standardized fields (title, brand, category, description, material, dimensions, certifications, price, keywords)
- **Confidence scoring** — every field gets a 0–100% AI confidence score
- **Explainable AI ("Why this value?")** — every field shows its evidence: a direct quote from the source document, or the category-based reasoning behind an inference
- **Honest gap-handling** — when information genuinely isn't available, CatalogIQ reports "Unknown / 0%" instead of hallucinating a plausible-sounding value
- **Human-in-the-loop review** — reviewers can Approve, Edit, or ask the AI to Re-check any individual field
- **Live AI re-validation** — a "Re-check with AI" action asks Gemini to re-examine a field against the source text on demand
- **Version history** — every AI extraction and manual edit is saved as an immutable, timestamped version
- **Google OAuth + email/password authentication** — JWT stored in httpOnly cookies, bcrypt-hashed passwords
- **Dashboard** — live KPIs (products processed, average confidence, items needing review), a review queue sorted by weakest field, and a pipeline status tracker
- **Insights** — aggregate analytics: which fields are weakest across the whole catalog, which fields the AI most often has to infer, and per-product quality scores
- **Custom design system** — a "spec sheet / engineering blueprint" visual language (dimension leader-lines connecting extracted fields to their evidence) built specifically around the industrial product domain, with full light/dark mode

## 4. Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS (custom design system: Space Grotesk / Inter / IBM Plex Mono, blueprint-grid theme)
- React Router

**Backend**
- Node.js + Express
- MongoDB Atlas (Mongoose ODM)
- JWT authentication (httpOnly cookies) + bcrypt
- Google Identity Services (OAuth 2.0 "Continue with Google")
- Zod (request validation)
- Multer (PDF upload handling)
- pdf-parse (PDF text extraction, with scanned/image-only PDF detection)

**AI**
- Google Gemini API (`@google/generative-ai`) — structured JSON extraction, confidence scoring, and evidence generation via engineered prompts that force the model to justify every answer

**Infrastructure**
- MongoDB Atlas (cloud database)
- Deployed on [Render] (backend) and [Vercel] (frontend) — *update once deployed*

## 5. How It Works (Pipeline)

```
Ingest → Extract → Normalize → Validate → Enrich → Human Review → Catalog
```

1. **Ingest** — user uploads a PDF or pastes raw text
2. **Extract** — text is pulled from the PDF (or used directly), then sent to Gemini
3. **Structured parsing** — Gemini returns strict JSON matching a fixed 9-field product schema
4. **Validation & confidence scoring** — each field is tagged `verified` (found directly in source) or `ai_inferred` (filled via category reasoning), with a 0–100% confidence score and a one-sentence evidence explanation
5. **Enrichment** — fields missing from the source text are filled using category-aware reasoning rather than left blank, but always honestly labeled as inferred
6. **Human review** — a reviewer works through each field: approve it, manually edit it, or trigger a live AI re-check
7. **Versioning** — every change (AI extraction or manual edit) creates a new immutable version, so the full history of how a product record evolved is always auditable

## 6. Project Structure

```
catalogiq/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── models/         # User, Product, Version (Mongoose schemas)
│       ├── middleware/     # auth (JWT), upload (multer), rate limiting
│       ├── services/       # geminiService.js (AI), pdfService.js (extraction)
│       ├── controllers/    # auth & product business logic
│       ├── routes/         # Express route definitions
│       └── utils/          # Zod schemas, async error handling
└── frontend/
    └── src/
        ├── pages/           # Login, Register, Dashboard, Upload, Insights, ProductReview
        ├── components/      # ExplainableField, ConfidenceBadge, AppLayout, GoogleAuthButton
        ├── context/         # Auth state, theme (dark/light)
        └── api/             # Axios client
```

## 7. Setup & Local Development

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier)
- A Gemini API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))
- A Google OAuth Client ID ([console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials))

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_GOOGLE_CLIENT_ID
npm run dev
```

Visit `http://localhost:5173`.

## 8. Why This Approach

Most "AI catalog enrichment" demos stop at extraction — text in, structured JSON out. We deliberately went further, because the actual UniHack challenge statement asked for **explainable outputs**, not just structured ones. A distributor won't trust an AI-generated product catalog they can't audit. By making every field's confidence and evidence a first-class part of the data model (not a UI afterthought), CatalogIQ is closer to something that could plug into a real PIM (Product Information Management) pipeline — which is literally Unilog's own core business — rather than a one-off hackathon demo.

## 9. Team

*(add team member names & roles here)*

## 10. Future Scope

- Duplicate/variant product detection using embedding similarity (backend logic exists, UI pending)
- OCR support for scanned/image-only PDFs
- Bulk/batch catalog processing for thousands of SKUs at once
- REST API for direct integration into an existing PIM/eCommerce system
- Category-specific attribute schemas (e.g. valves need pressure ratings; cables need gauge/voltage)

---

Built for **UniHack 2026**, hosted by **Unilog** in collaboration with **Hack2Skill**.
