import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const textIngestSchema = z.object({
  rawText: z.string().min(20, "Provide at least a short paragraph of product text"),
});

export const urlIngestSchema = z.object({
  url: z.string().url(),
});

// generic middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Validation failed", errors: result.error.flatten() });
  }
  req.body = result.data;
  next();
};
