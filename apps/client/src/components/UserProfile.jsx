import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import { useEventContext } from '../hooks/useEventContext.js';
import { updateUserProfile } from '../api/auth';
import EventCard from './EventCard';
import { motion } from 'framer-motion';
import '../index.css';

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const { fetchOrganizerEvents, fetchMyEvents, events, myEvents, loading, error } = useEventContext();
  const [editMode, setEditMode] = useState(false);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [tempName, setTempName] = useState(user.name);

  useEffect(() => {
    // Fetch recent events based on role
    if (user.role === 'organizer') {
      fetchOrganizerEvents();
    } else {
      fetchMyEvents();
    }
  }, [user.role]);

  useEffect(() => {
    if (!editMode) {
      setTempEmail(user.email);
      setTempName(user.name);
    }
  }, [user.email, user.name, editMode]);

  const handleSave = async () => {
    const emailUnchanged = tempEmail === user.email;
    const nameUnchanged = tempName === user.name;

    if (emailUnchanged && nameUnchanged) {
      setEditMode(false);
      return;
    }

    const payload = {
      email: emailUnchanged ? "" : tempEmail,
      name: nameUnchanged ? "" : tempName,
    };

    try {
      const response = await updateUserProfile(payload);
      const updatedUser = response.data.user;
      setEditMode(false);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setTempEmail(user.email);
    setTempName(user.name);
    setEditMode(false);
  };

  // Get recent 3 events, sorted by start date (descending)
  const recentEvents = (user.role === 'organizer' ? events : myEvents)
    .sort((a, b) => new Date(b.EVENT_START_DATE) - new Date(a.EVENT_START_DATE))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-bold">
            {(user.name || user.email)?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            {editMode ? (
              <>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                />
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                />
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-800">{tempName}</p>
                <p className="text-base text-gray-600">{tempEmail}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </>
            )}
          </div>
          <div className="flex space-x-4">
            {editMode ? (
              <>
                <motion.button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Save
                </motion.button>
                <motion.button
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Cancel
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={() => setEditMode(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Edit
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-800">
          Recently {user.role === 'organizer' ? 'Created' : 'Registered'} Events
        </h2>
        {loading ? (
          <motion.p
            className="text-base text-teal-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading events...
          </motion.p>
        ) : error ? (
          <motion.p
            className="text-base text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : recentEvents.length === 0 ? (
          <motion.p
            className="text-base text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No events found.
          </motion.p>
        ) : (
          <div className="space-y-6 px-16">
            {recentEvents.map((event, index) => (
              <motion.div
                key={event.EVENT_ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <EventCard event={event} showOrganizer={user.role === 'participant'} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}