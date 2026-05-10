import express from "express";
import {
  getFeedbackByEventId,
  addFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/:eventId", getFeedbackByEventId);
router.post("/", addFeedback); // expects body: { event_id, user_id, comment_text }

export default router;
