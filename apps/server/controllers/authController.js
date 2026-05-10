import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {generateTokens, normalizeUser } from "../utils/auth.js";

import { registerUser, getUserByEmail, updateUserDetails } from "../db/authQueries.js";


const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser && role == existingUser.role) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await registerUser(name, email, hashedPassword, role);

    if (!result.success) {
      return res.status(400).json({ msg: result.msg });
    }

    // const token = jwt.sign({ email, role ,id: result.user.id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });
    const user = { email, role ,id: result.user.id, name }
    const { accessToken, refreshToken } = generateTokens(user);


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      msg: "User registered",
      accessToken,
      user: { id: result.user.id, name, email, role },
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ msg: "Registration failed" });
  }
};


const login = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await getUserByEmail(email, role);

  if (!user) return res.status(400).json({ msg: "User does not exist" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✨ Include email and role in response
  res.status(200).json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ msg: "No refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    res.status(200).json({ accessToken });
  });
};


export const editUser = async (req, res) => {
  const { id } = req.user; // assuming userId is set from JWT middleware
  const { name, email } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    const result = await updateUserDetails(id, name, email);
    res.status(200).json({ message: "User updated successfully", user: result });
  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export default {register, login, refreshAccessToken, editUser}
