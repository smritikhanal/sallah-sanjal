const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getCurrentClientProfile,
  updateClientProfile,
  getClientBookings,
  getClientMessages,
} = require('../controllers/clientController');

const router = express.Router();

// All client routes require authentication
router.use(authMiddleware);

// Client profile
router.get('/profile', getCurrentClientProfile);
router.put('/profile', updateClientProfile);

// Client bookings
router.get('/bookings', getClientBookings);

// Client messages/conversations
router.get('/messages', getClientMessages);

module.exports = router;
