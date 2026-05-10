import { createContext, useContext, useState } from "react";
import {
  getOrganizerEvents,
  getParticipantEvents,
  getMyEvents,
  createNewEvent,
  deleteEventById, // ✅ 1. Import delete API function
} from "../api/events";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slotSuggestions, setSlotSuggestions] = useState([]);

  const fetchOrganizerEvents = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getOrganizerEvents(filters);
      setEvents(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch organizer events");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantEvents = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getParticipantEvents(filters);
      setEvents(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch participant events");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getMyEvents(filters);
      setMyEvents(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch my events");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      setSlotSuggestions([]);

      const res = await createNewEvent(eventData);

      if (res.status === 201) {
        return true;
      }
      setError("Unexpected response creating event");
      return false;
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.suggestions) {
        setSlotSuggestions(err.response.data.suggestions);
        setError("Time slot unavailable—see suggestions below");
        return false;
      }
      // Other errors
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. Add delete function
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await deleteEventById(eventId);
      setEvents(prev => prev.filter(e => e.event_id !== eventId));
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        myEvents,
        fetchOrganizerEvents,
        fetchParticipantEvents,
        fetchMyEvents,
        createEvent,
        deleteEvent, // ✅ 3. Expose it
        slotSuggestions,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => useContext(EventContext);
