import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  //useEffect(() => {
  //  const token = localStorage.getItem("token");
  //  if (token) {
  //    try {
  //      const decoded = jwtDecode(token);
  //      setUser({ email: decoded.email, role: decoded.role });
  //    } catch (err) {
  //      console.error("Invalid token:", err);
  //      localStorage.removeItem("token");
  //      setUser(null);
  //    }
  //  }
  //}, []);

  const login = async (email, password, role) => {
    const res = await loginUser(email, password, role);
    const { accessToken, user } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await registerUser(name, email, password, role);
      const { accessToken, user } = res.data;
      console.log("userid:", user.id, "Type:", typeof user.id);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message;
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
