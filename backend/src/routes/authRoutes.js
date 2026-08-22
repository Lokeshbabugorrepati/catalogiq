import { Router } from "express";
import { register, login, logout, me, googleLogin } from "../controllers/authController.js";
import { validate, registerSchema, loginSchema } from "../utils/schema.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
