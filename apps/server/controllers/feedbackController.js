import {
  fetchFeedbackByEventId,
  insertFeedback,
} from "../db/feedbackQueries.js";

export const getFeedbackByEventId = async (req, res) => {
  const { eventId } = req.params;

  try {
    const feedback = await fetchFeedbackByEventId(eventId);
    res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addFeedback = async (req, res) => {
  const { event_id, user_id, comment_text } = req.body;

  if (!event_id || !user_id || !comment_text) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const newFeedback = await insertFeedback(event_id, user_id, comment_text);
    const io = req.io;
    if (io) {
      io.emit('newFeedback', newFeedback);
      console.log("New feedback emitted to all clients:", newFeedback);
    } else {
      console.error("Socket.IO instance not available in feedback controller.");
    }
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
