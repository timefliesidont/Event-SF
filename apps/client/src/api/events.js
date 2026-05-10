import axiosInstance from "./axiosInstance";

export const getOrganizerEvents = async () => {
  return await axiosInstance.get("/events/organizer");
};


export const getParticipantEvents = async (filters = {}) => {
  return await axiosInstance.get("/events/participant/all", {
    params: filters,
  });
};

export const getMyEvents = async (filters = {}) => {
  return await axiosInstance.get("/events/participant/myevents", {
    params: filters,
  });
};

export const createNewEvent = async (eventData) => {
  return await axiosInstance.post("/events/create", eventData);
} 

export const getEventById = async (eventId) => {
  const response = await axiosInstance.get(`/events/${eventId}`);
  return response.data;
};

export const postEventFeedback = async (eventId, userId, commentText) => {
  const response = await axiosInstance.post(
    "/feedback",
    { event_id: eventId, user_id: userId, comment_text: commentText },
  );
  return response.data;
};

export const fetchEventFeedback = async (eventId) => {
  const response = await axiosInstance.get(`/feedback/${eventId}`);
  return response.data; // expect an array of { id, user_id, comment_text, created_at }
};

export const joinEvent = async (eventId) => {
  const response = await axiosInstance.post(
    `/events/${eventId}/join`,
    {},              // no body needed
    { withCredentials : true } 
  );
  return response.data;
};

export const deleteEventById = async (eventId) => {
  const response = await axiosInstance.delete(`/events/${eventId}`);
  // console.log("Delete response:", response.data); 
  return response.data; 
};