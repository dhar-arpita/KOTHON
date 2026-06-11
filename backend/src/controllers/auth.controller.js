const bcrypt  = require('bcryptjs');
const { signToken, createUserObject } = require('../utils/auth.utils');

// In-memory user store — replace with your DB of choice
// MongoDB:    const User = require('../models/User.model');
// PostgreSQL: const db   = require('../config/db');
const users = [];

// ─── Register ─────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // ── Duplicate check ──────────────────────────────
    const exists = users.find(u => u.email === email);
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // ── Hash password ────────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    // ── Save user ────────────────────────────────────
    // MongoDB:    const user = await User.create({ username, email, password: hashed });
    // PostgreSQL: const { rows } = await db.query(
    //               'INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING *',
    //               [username, email, hashed]);
    //             const user = rows[0];
    const user = { id: Date.now().toString(), username, email, password: hashed };
    users.push(user);

    const token = signToken(user.id);
    res.status(201).json({ token, user: createUserObject(user) });

  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Find user ────────────────────────────────────
    // MongoDB:    const user = await User.findOne({ email }).select('+password');
    // PostgreSQL: const { rows } = await db.query(
    //               'SELECT * FROM users WHERE email=$1', [email]);
    //             const user = rows[0];
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── Verify password ──────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    res.json({ token, user: createUserObject(user) });

  } catch (err) {
    next(err);
  }
};

// ─── Get current user (protected) ────────────────────
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware after token verification
    // MongoDB:    const user = await User.findById(req.user.id);
    // PostgreSQL: const { rows } = await db.query(
    //               'SELECT id,username,email FROM users WHERE id=$1', [req.user.id]);
    //             const user = rows[0];
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: createUserObject(user) });
  } catch (err) {
    next(err);
  }
};
