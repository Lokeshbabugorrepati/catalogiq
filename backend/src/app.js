import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// central error handler
app.use((err, req, res, next) => {
  console.error(err);

  // Gemini/Google API errors have a numeric status but a very technical message -
  // surface something a reviewer/demo audience can actually understand.
  if (err.message?.includes("GoogleGenerativeAI")) {
    return res.status(502).json({
      message: "The AI service couldn't process this request. This is usually a temporary issue or an outdated model name - please try again.",
    });
  }

  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;
