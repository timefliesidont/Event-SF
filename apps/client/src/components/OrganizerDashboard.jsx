import { useEffect } from "react";
import { useEventContext } from "../hooks/useEventContext.js";
import EventCard from "./EventCard.jsx";
import { motion } from "framer-motion";
import '../index.css';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL);

const OrganizerDashboard = () => {
  const { events, fetchOrganizerEvents, createEvent, loading, error } = useEventContext();

  useEffect(() => {
    fetchOrganizerEvents();

    socket.on("eventDeleted", (eventId) => {
      console.log("Event deleted:", eventId);
      fetchOrganizerEvents(); 
    });
    
    return () => {
      socket.off("eventDeleted");
    };
  }, [socket]);

  return (
    <div className="p-6 space-y-8">

      {/* Loading/Error Handling */}
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

      {/* Event List */}
      <div>
      <motion.h1
        className="text-xl font-bold text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Your Events
      </motion.h1>
        {events.length === 0 ? (
          <motion.p
            className="text-base text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No events created yet.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.event_id}
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
    </div>
  );
};

export default OrganizerDashboard;