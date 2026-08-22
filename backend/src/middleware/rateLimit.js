import rateLimit from "express-rate-limit";

// Limits Gemini calls per authenticated user to avoid quota exhaustion / abuse
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { message: "Too many AI requests, please wait a moment." },
});
