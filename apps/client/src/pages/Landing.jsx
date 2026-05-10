import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import '../index.css';

export default function Landing() {
  const groupMembers = [
    { name: 'Harkirat', enrollment: 'IIT2023096' },
    { name: 'Siddharth', enrollment: 'IIT2023091' },
    { name: 'Samay', enrollment: 'IIT2023069' },
    { name: 'Shranay', enrollment: 'IIT2023093' },
    { name: 'Anirudh', enrollment: 'IIT2023007' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Welcome to Echoboard
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          Plan, manage, and celebrate your events with ease and elegance.
        </motion.p>
        <div className="flex space-x-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition duration-300"
            >
              Login
            </Link>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-700 text-white rounded-full font-semibold hover:bg-indigo-800 transition duration-300"
            >
              Register
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Group Members Section */}
      <section id="team" className="h-screen py-24 bg-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Group</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-12">
          {groupMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg px-6 py-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
              <p className="text-gray-600 mt-2">Enrollment: {member.enrollment}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}