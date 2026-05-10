import Dashboard from "./Dashboard.jsx";
import useAuth from "../hooks/useAuth.js";
import Navbar from "../components/Navbar.jsx";
import { motion } from "framer-motion";
import '../index.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-4">
        {user ? (
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {user.name} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
              </h1>
              <p className="text-base text-gray-600 mt-2">
                Manage your events and explore opportunities below.
              </p>
            </motion.div>
            <Dashboard />
          </div>
        ) : (
          <motion.p
            className="text-base text-gray-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading user data...
          </motion.p>
        )}
      </div>
    </>
  );
};

export default Home;