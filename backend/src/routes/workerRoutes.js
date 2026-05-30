const express = require('express');
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const {
  getAllWorkers,
  getWorkerProfile,
  createWorkerProfile,
  updateWorkerProfile,
  addServiceToWorker,
  getCurrentWorkerProfile,
  getWorkerBookings,
  getWorkerReviews,
  createTestimonial,
  getWorkerTestimonials,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/workerController');

const router = express.Router();

// Public routes
router.get('/all', getAllWorkers);

// Authenticated worker routes (must be before :workerId route)
router.get('/me', authMiddleware, authorizeRole('worker'), getCurrentWorkerProfile);
router.get('/bookings', authMiddleware, authorizeRole('worker'), getWorkerBookings);
router.get('/reviews', authMiddleware, authorizeRole('worker'), getWorkerReviews);
router.get('/testimonials', authMiddleware, authorizeRole('worker'), getWorkerTestimonials);
router.post('/testimonials', authMiddleware, authorizeRole('worker'), createTestimonial);
router.patch('/testimonials/:testimonialId', authMiddleware, authorizeRole('worker'), updateTestimonial);
router.delete('/testimonials/:testimonialId', authMiddleware, authorizeRole('worker'), deleteTestimonial);

// Parameterized routes
router.get('/:workerId', getWorkerProfile);

// Protected routes
router.post('/profile', authMiddleware, authorizeRole('worker'), createWorkerProfile);
router.put('/profile', authMiddleware, authorizeRole('worker'), updateWorkerProfile);
router.post('/services', authMiddleware, authorizeRole('worker'), addServiceToWorker);

module.exports = router;
