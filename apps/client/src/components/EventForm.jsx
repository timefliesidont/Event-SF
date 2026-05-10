import { useState } from "react";
import { useEventContext } from "../hooks/useEventContext.js";
import { motion } from "framer-motion";
import '../index.css';
import { useNavigate } from "react-router-dom";

const EventForm = () => {
  const { createEvent, loading, error, setError, slotSuggestions } = useEventContext();
  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["title", "start_datetime", "end_datetime"];
    for (const field of required) {
      if (!formData[field]) {
        setError("Please fill out all required fields.");
        return;
      }
    }

    // Validate start_datetime < end_datetime
    const start = new Date(formData.start_datetime);
    const end = new Date(formData.end_datetime);
    if (start >= end) {
      setError("Start time must be earlier than end time.");
      return;
    }

    // Format data for backend
    const eventData = {
      title: formData.title,
      description: formData.description,
      start_date: formData.start_datetime.split("T")[0], // YYYY-MM-DD
      start_time: formData.start_datetime.split("T")[1], // HH:MM
      end_time: formData.end_datetime.split("T")[1], // HH:MM
      location: formData.location,
    };

    try {
      // Clear previous error
      setError(null);
      console.log("Submitting event data:", eventData);

      // Call onSubmit (assumes it calls createEvent)
      const response = await createEvent(eventData);
      console.log("Response from createEvent:", response);

      if (response) {
        setFormData({
          title: "",
          description: "",
          start_datetime: "",
          end_datetime: "",
          location: "",
        });
        setError(null);
        navigate('/home');
      } else if (response && response.msg === "Time slot unavailable") {
        setError("Time slot unavailable. Try these suggestions:");
      } else {
        setError(response?.msg || "Failed to create event. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to create event. Please try again.");
    }
  };

  // Format suggestion times for display
  const formatSuggestionTime = (time, date) => {
    const [hours, minutes] = time.split(':');
    const suggestionDate = new Date(`${date}T${hours}:${minutes}:00+05:30`);
    return suggestionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {error && (
          <motion.div
            className="text-sm text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>{error}</p>
            {slotSuggestions.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {slotSuggestions.map((slot, idx) => (
                  <li key={idx}>
                    {formatSuggestionTime(slot.start_time, formData.start_datetime.split("T")[0])} –{" "}
                    {formatSuggestionTime(slot.end_time, formData.start_datetime.split("T")[0])}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Event Title <span className="text-teal-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Event Title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 resize-none"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Start Date & Time <span className="text-teal-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              End Date & Time <span className="text-teal-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? "Creating..." : "Create Event"}
        </motion.button>
      </motion.form>
    </>
  );
};

export default EventForm;