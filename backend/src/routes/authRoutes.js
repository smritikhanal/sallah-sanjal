const express = require('express');
const { register, login, refreshAccessToken, verifyToken } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;
