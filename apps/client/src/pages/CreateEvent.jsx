import EventForm from "../components/EventForm";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useEventContext } from "../contexts/EventContext";
import '../index.css';

const EventCreator = () => {

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h1>
          <EventForm />
        </motion.div>
      </div>
    </>
  );
};

export default EventCreator;