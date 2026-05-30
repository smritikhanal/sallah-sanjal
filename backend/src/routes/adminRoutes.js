const express = require('express');
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const {
  getAnalytics,
  getAllWorkers,
  getWorkerDetail,
  verifyWorker,
  getAllClients,
  getIssues,
  updateIssueStatus,
  getTestimonials,
  updateTestimonialVisibility,
  getAnalyticsTrends
} = require('../controllers/adminController');

const router = express.Router();

// Public routes (no auth required)
// Testimonials - public read
router.get('/testimonials', getTestimonials);

// All other admin routes require authentication and admin role
router.use(authMiddleware, authorizeRole('admin'));

// Analytics
router.get('/analytics', getAnalytics);
router.get('/analytics/trends', getAnalyticsTrends);

// Workers management
router.get('/workers', getAllWorkers);
router.get('/workers/:workerId', getWorkerDetail);
router.patch('/workers/:workerId/verify', verifyWorker);

// Clients management
router.get('/clients', getAllClients);

// Issues management
router.get('/issues', getIssues);
router.patch('/issues/:issueId', updateIssueStatus);

// Testimonials management - protected write operations
router.patch('/testimonials/:testimonialId/visibility', updateTestimonialVisibility);

module.exports = router;
