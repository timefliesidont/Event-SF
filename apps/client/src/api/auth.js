import axios from "./axiosInstance";

export const loginUser = (email, password, role) => {
  return axios.post("/auth/login", { email, password, role }, { withCredentials: true });
};

export const registerUser = (name, email, password, role) => {
  return axios.post("/auth/register", { name, email, password, role }, { withCredentials: true });
};

export const updateUserProfile = ({ email, name }) => {
  return axios.post("/auth/edit", { email, name });
};
