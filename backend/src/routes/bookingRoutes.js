const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getBookingDetails,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:bookingId', getBookingDetails);
router.put('/:bookingId', updateBookingStatus);

module.exports = router;
