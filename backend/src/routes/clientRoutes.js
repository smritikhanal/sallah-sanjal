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

// GET /api/client/profile — Current client's profile
router.get('/profile', getCurrentClientProfile);
// PUT /api/client/profile — Update client profile
router.put('/profile', updateClientProfile);

// GET /api/client/bookings — Client's booking history
router.get('/bookings', getClientBookings);

// GET /api/client/messages — Client's conversations
router.get('/messages', getClientMessages);

module.exports = router;
