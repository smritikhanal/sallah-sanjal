const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createReview,
  getWorkerReviews,
  getUserReviews,
} = require('../controllers/reviewController');

const router = express.Router();

// Public route
router.get('/worker/:workerId', getWorkerReviews);

// Protected routes
router.use(authMiddleware);
router.post('/', createReview);
router.get('/user/reviews', getUserReviews);

module.exports = router;
