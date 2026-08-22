import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setTokenCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  setTokenCookie(res, { id: user._id, role: user.role });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials, or this account uses Google sign-in" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  setTokenCookie(res, { id: user._id, role: user.role });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
};

// POST /api/auth/google  { credential: <Google ID token from the Sign In With Google button> }
export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Missing Google credential" });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Google credential" });
  }

  const { sub: googleId, email, name } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({ name, email, googleId });
  } else if (!user.googleId) {
    // existing password-based account signing in with Google for the first time -> link it
    user.googleId = googleId;
    await user.save();
  }

  setTokenCookie(res, { id: user._id, role: user.role });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};
