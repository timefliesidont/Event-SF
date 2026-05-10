import { useEffect, useState } from "react";
import { useEventContext } from "../hooks/useEventContext.js";
import EventCard from "./EventCard.jsx";
import { motion } from "framer-motion";
import '../index.css';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL);

const ParticipantDashboard = () => {
  const {
    fetchMyEvents,
    fetchParticipantEvents,
    myEvents,
    events,
    loading,
    error,
  } = useEventContext();

  const [activeTab, setActiveTab] = useState("all"); // "my" or "all"
  const [filter, setFilter] = useState({ date: "", month: "" });

  // Fetch events based on tab and filters
  useEffect(() => {
    if (activeTab === "my") {
      fetchMyEvents(filter);
    } else {
      fetchParticipantEvents(filter);
    }

    socket.on("eventDeleted", (eventId) => {
      console.log("Event deleted:", eventId);
      if (activeTab === "my") {
        fetchMyEvents(filter);
      } else {
        fetchParticipantEvents(filter);
      }
    });

    socket.on("eventCreated", (eventId) => {
      console.log("Event created:", eventId);
      if (activeTab === "my") {
        fetchMyEvents(filter);
      } else {
        fetchParticipantEvents(filter);
      }
    });

    return () => {
      socket.off("eventCreated");
    };

    return () => {
      socket.off("eventDeleted");
    };

  }, [activeTab, filter , socket]);

  const handleTabSwitch = (tab) => setActiveTab(tab);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 space-y-8">

      {/* Tabs */}
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-300 ${
            activeTab === "my"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => handleTabSwitch("my")}
        >
          My Events
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-300 ${
            activeTab === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => handleTabSwitch("all")}
        >
          All Events
        </button>
      </motion.div>

      {/* Filter */}
      <motion.div
        className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-teal-500 text-sm">📅</span>
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-teal-500 text-sm">🗓️</span>
          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 bg-white"
          >
            <option value="">-- Filter by Month --</option>
            {[...Array(12)].map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {new Date(0, idx).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Events */}
      {loading && (
        <motion.p
          className="text-base text-teal-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading events...
        </motion.p>
      )}
      {error && (
        <motion.p
          className="text-base text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>
      )}

      {!loading && (activeTab === "my" ? myEvents : events).length === 0 ? (
        <motion.p
          className="text-base text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No events found.
        </motion.p>
      ) : (
        <div className="space-y-6">
          {(activeTab === "my" ? myEvents : events).map((event, index) => (
            <motion.div
              key={event.EVENT_ID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;