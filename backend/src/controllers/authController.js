const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, profileImage, image } = req.body;
    const imagePath = profileImage || image || null;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone, role || 'client', imagePath]
    );

    const userId = result.insertId;

    // Generate tokens
    const accessToken = generateAccessToken(userId, role || 'client');
    const refreshToken = generateRefreshToken(userId, role || 'client');

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      userId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const [users] = await pool.query('SELECT id, password, role FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { verifyRefreshToken } = require('../utils/jwtUtils');
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed', details: error.message });
  }
};

// Verify token and return user info
const verifyToken = async (req, res) => {
  try {
    const { userId } = req.user;

    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  verifyToken,
};
