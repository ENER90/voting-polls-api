import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 📝 Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);

// 🔐 Protected routes (authentication required)
router.get("/me", authenticateToken, getProfile);

export default router;
