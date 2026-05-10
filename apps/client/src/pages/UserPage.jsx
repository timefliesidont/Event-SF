import React from 'react';
import UserProfile from '../components/UserProfile';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import '../index.css';

const UserPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-4">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <UserProfile />
        </motion.div>
      </div>
    </>
  );
};

export default UserPage;