// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) =>
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(form.email, form.password);
//       navigate("/home");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.msg || "Login failed");
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-12">
//       <h2 className="text-2xl font-semibold mb-4">Login</h2>
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import '../index.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState("organizer"); // Default to organizer

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password, activeRole);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  const handleToggleRole = () => {
    const newRole = activeRole === "organizer" ? "participant" : "organizer";
    setActiveRole(newRole);
    setForm({ email: "", password: "" }); // Reset form on role change
    setError(""); // Clear error on role change
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Login to Echoboard</h2>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
          <div className="relative inline-flex items-center">
            <span className="mr-3 text-base font-medium text-gray-600">Organizer</span>
            <button
              onClick={handleToggleRole}
              className="w-12 h-6 bg-gray-300 rounded-full p-1 transition duration-300 ease-in-out"
            >
              <motion.div
                className={`w-4 h-4 rounded-full bg-indigo-600 shadow-md`}
                animate={{ x: activeRole === "participant" ? 24 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </button>
            <span className="ml-3 text-base font-medium text-gray-600">Participant</span>
          </div>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={activeRole}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <motion.p
                className="text-red-500 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {error}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                required
              />
            </motion.div>
            <motion.button
              type="submit"
              className="w-full bg-indigo-600 text-white p-4 rounded-lg font-semibold text-base hover:bg-indigo-700 transition duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              Login as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
            </motion.button>
          </motion.form>
        </AnimatePresence>
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="text-gray-600 text-sm">Don't have an account? </span>
          <Link
            to="/register"
            className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition duration-300"
          >
            Register
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;