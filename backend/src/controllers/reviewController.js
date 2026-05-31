const pool = require('../config/database');

// Create review
const createReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { bookingId, workerId, rating, comment, professionalism, qualityOfWork, communication } = req.body;

    // Check if booking is completed
    const [booking] = await pool.query(
      'SELECT status FROM bookings WHERE id = ? AND client_id = ?',
      [bookingId, userId]
    );

    if (booking.length === 0 || booking[0].status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE booking_id = ?',
      [bookingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (booking_id, reviewer_id, worker_id, rating, comment, professionalism, quality_of_work, communication)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, workerId, rating, comment, professionalism, qualityOfWork, communication]
    );

    // Update worker's average rating
    const [reviews] = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE worker_id = ?',
      [workerId]
    );

    const avgRating = reviews[0].avg_rating || 0;
    await pool.query(
      'UPDATE worker_profiles SET average_rating = ? WHERE id = ?',
      [avgRating, workerId]
    );

    res.status(201).json({
      message: 'Review created successfully',
      reviewId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review', details: error.message });
  }
};

// Get reviews for worker
const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reviews] = await pool.query(
      `SELECT r.*, u.first_name, u.last_name FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.worker_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [workerId, parseInt(limit), offset]
    );

    res.json({
      reviews,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.user;

    const [reviews] = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, b.service_id
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN bookings b ON r.booking_id = b.id
       WHERE r.reviewer_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user reviews', details: error.message });
  }
};

module.exports = {
  createReview,
  getWorkerReviews,
  getUserReviews,
};
