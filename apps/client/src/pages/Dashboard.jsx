import useAuth from "../hooks/useAuth.js";
import OrganizerDashboard from "../components/OrganizerDashboard.jsx";
import ParticipantDashboard from "../components/ParticipantDashboard.jsx";
import { motion } from "framer-motion";
import '../index.css';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return (
    <motion.p
      className="text-base text-gray-600 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Loading...
    </motion.p>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {user.role === "organizer" ? (
        <OrganizerDashboard />
      ) : (
        <ParticipantDashboard />
      )}
    </motion.div>
  );
};

export default Dashboard;