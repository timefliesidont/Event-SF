import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, postEventFeedback, fetchEventFeedback, joinEvent } from "../api/events";
import useAuth from "../hooks/useAuth.js";
import Navbar from "../components/Navbar.jsx";
import { motion } from "framer-motion";
import io from 'socket.io-client';
import '../index.css';

const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL);

const EventPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFb, setLoadingFeedback] = useState(true);
  const [errorFb, setFeedbackError] = useState(null);

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        console.log(data);
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load event.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await fetchEventFeedback(eventId);
        setFeedbacks(data);
      } catch (err) {
        console.error(err);
        setFeedbackError("Failed to load feedback.");
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedbacks();

    const handleNewFeedback = (feedbackData) => {
      fetchFeedbacks();
    };

    socket.on('newFeedback', handleNewFeedback);

    return () => {
      socket.off('newFeedback', handleNewFeedback);
    };
  }, [eventId, socket]);

  if (loading) return (
    <motion.p
      className="text-base text-gray-600 text-center pt-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Loading event...
    </motion.p>
  );
  if (error) return (
    <motion.p
      className="text-base text-red-500 text-center pt-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {error}
    </motion.p>
  );
  if (!event) return (
    <motion.p
      className="text-base text-gray-500 text-center pt-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      No event found.
    </motion.p>
  );

  const isParticipant = user?.role === "participant";
  const isOrganizer = user?.role === "organizer";

  const handleFeedbackSubmit = async () => {
    try {
      const response = await postEventFeedback(eventId, user.id, feedbackText);
      setFeedbackStatus({ type: "success", message: "Feedback submitted successfully!" });
      setFeedbackText("");
    } catch (error) {
      console.error(error);
      setFeedbackStatus({ type: "error", message: "Failed to submit feedback. Please try again." });
    }
  };

  const handleJoin = async () => {
    try {
      await joinEvent(eventId);
      alert("You've successfully joined this event!");
    } catch (err) {
      console.error("Join error:", err);
      if (err.response?.status === 409) {
        return alert(err.response.data.message);
      }
      alert("Could not join the event. Try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-4">
        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <motion.h1
              className="text-4xl font-bold text-gray-800 mb-4 sm:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {event.EVENT_TITLE}
            </motion.h1>
            {isParticipant && (
              <motion.button
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-indigo-700 transition duration-300"
                onClick={handleJoin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                Join Event
              </motion.button>
            )}
          </div>
          <motion.div
            className="text-sm text-gray-600 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>
              <span className="text-teal-500">📅</span> {new Date(event.EVENT_START_DATE).toLocaleDateString()}
            </p>
            <p>
              <span className="text-teal-500">🕒</span> {event.EVENT_START_TIME} – {event.EVENT_END_TIME}
            </p>
            <p>
              <span className="text-teal-500">📍</span> {event.EVENT_LOCATION || "Not specified"}
            </p>
          </motion.div>
          <motion.p
            className="text-base text-gray-700 whitespace-pre-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {event.EVENT_DESCRIPTION || "No description provided."}
          </motion.p>

          <div className="pt-12" />

          {/* Feedback Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-800">Feedbacks</h2>

            {/* Input box (participants only) */}
            {isParticipant && (
              <div className="space-y-4">
                <motion.textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Leave your feedback..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 resize-none"
                  rows={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
                <motion.button
                  onClick={handleFeedbackSubmit}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Submit Feedback
                </motion.button>
                {feedbackStatus && (
                  <motion.p
                    className={`text-sm ${feedbackStatus.type === "success" ? "text-teal-500" : "text-red-500"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feedbackStatus.message}
                  </motion.p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {loadingFb ? (
                <motion.p
                  className="text-base text-teal-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Loading feedback…
                </motion.p>
              ) : errorFb ? (
                <motion.p
                  className="text-base text-red-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {errorFb}
                </motion.p>
              ) : feedbacks.length === 0 ? (
                <motion.p
                  className="text-base text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  No comments yet.
                </motion.p>
              ) : (
                feedbacks.map((fb, idx) => {
                  const id = fb.FEEDBACK_ID ?? fb.id ?? idx;
                  const userName = fb.USER_NAME ?? fb.user_name ?? fb.userName ?? "Unknown";
                  const comment = fb.COMMENT_TEXT ?? fb.comment_text ?? fb.comment ?? "";
                  const raw = fb.CREATED_AT ?? fb.created_at;
                  const date = raw ? new Date(raw).toLocaleString() : "No timestamp";
                  const initial = userName.charAt(0).toUpperCase();

                  return (
                    <motion.div
                      key={id}
                      className="flex items-start space-x-4 bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-base font-semibold">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-800">{userName}</p>
                          <p className="text-sm text-gray-500">{date}</p>
                        </div>
                        <p className="text-lg text-gray-700">{comment}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default EventPage;