import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.json({
      users,
      total: users.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/", protect(["user"]), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/:id", protect(["user"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.delete("/:id", protect(["user"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
