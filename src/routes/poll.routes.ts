import { Router } from "express";
import {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
} from "../controllers/poll.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 📋 Public routes
router.get("/", getAllPolls);
router.get("/:id", getPollById);

// 🔐 Protected routes (authentication required)
router.post("/", authenticateToken, createPoll);
router.put("/:id", authenticateToken, updatePoll);
router.delete("/:id", authenticateToken, deletePoll);

export default router;
