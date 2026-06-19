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

// GET /api/workers/all — List all workers with optional filters
router.get('/all', getAllWorkers);

// GET /api/workers/me — Authenticated worker's own profile (must be before :workerId)
router.get('/me', authMiddleware, authorizeRole('worker'), getCurrentWorkerProfile);
// GET /api/workers/bookings — Worker's bookings
router.get('/bookings', authMiddleware, authorizeRole('worker'), getWorkerBookings);
// GET /api/workers/reviews — Worker's received reviews
router.get('/reviews', authMiddleware, authorizeRole('worker'), getWorkerReviews);
// GET /api/workers/testimonials — Worker's testimonials
router.get('/testimonials', authMiddleware, authorizeRole('worker'), getWorkerTestimonials);
// POST /api/workers/testimonials — Add a testimonial
router.post('/testimonials', authMiddleware, authorizeRole('worker'), createTestimonial);
// PATCH /api/workers/testimonials/:testimonialId — Update a testimonial
router.patch('/testimonials/:testimonialId', authMiddleware, authorizeRole('worker'), updateTestimonial);
// DELETE /api/workers/testimonials/:testimonialId — Delete a testimonial
router.delete('/testimonials/:testimonialId', authMiddleware, authorizeRole('worker'), deleteTestimonial);

// GET /api/workers/:workerId — Get a specific worker's public profile
router.get('/:workerId', getWorkerProfile);

// POST /api/workers/profile — Create worker profile
router.post('/profile', authMiddleware, authorizeRole('worker'), createWorkerProfile);
// PUT /api/workers/profile — Update worker profile
router.put('/profile', authMiddleware, authorizeRole('worker'), updateWorkerProfile);
// POST /api/workers/services — Add a service to worker's offerings
router.post('/services', authMiddleware, authorizeRole('worker'), addServiceToWorker);

module.exports = router;
