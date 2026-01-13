import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export const generateToken = (userId, res) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "none", // Required for cross-domain cookies (Vercel + Render)
    secure: process.env.NODE_ENV === "production", // Only require HTTPS in production
  });

  return token;
};
