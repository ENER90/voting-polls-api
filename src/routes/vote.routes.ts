import { Router } from "express";
import {
  castVote,
  getResults,
  getUserVotes,
} from "../controllers/vote.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/results/:pollId", getResults);

router.post("/", authenticateToken, castVote);
router.get("/my-votes", authenticateToken, getUserVotes);

export default router;
