const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  validateCreateBooking,
  validateBookingStatusUpdate,
} = require('../middleware/validators');
const {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getBookingDetails,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(authMiddleware);

// POST /api/bookings — Create a new booking
router.post('/', validateCreateBooking, createBooking);
// GET /api/bookings — List current user's bookings (as client or worker)
router.get('/', getUserBookings);
// GET /api/bookings/:bookingId — Get a single booking's details
router.get('/:bookingId', getBookingDetails);
// PUT /api/bookings/:bookingId — Update booking status (accept/reject/complete/cancel)
router.put('/:bookingId', validateBookingStatusUpdate, updateBookingStatus);

module.exports = router;
