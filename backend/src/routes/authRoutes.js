const express = require('express');
const { register, login, refreshAccessToken, verifyToken } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register — Create a new user account
router.post('/register', register);
// POST /api/auth/login — Authenticate and return JWT tokens
router.post('/login', login);
// POST /api/auth/refresh-token — Issue a new access token using a refresh token
router.post('/refresh-token', refreshAccessToken);
// GET /api/auth/verify — Verify the current token and return user info
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;
