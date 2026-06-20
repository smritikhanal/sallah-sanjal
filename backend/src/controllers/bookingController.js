const pool = require('../config/database');

// Booking controller — create, list, update status, and get booking details

// Create booking
const createBooking = async (req, res) => {
  try {
    const { userId } = req.user;
    const { workerId, serviceId, bookingDate, durationHours, location, notes } = req.body;

    // Get worker profile ID using user ID (workerId from frontend is the user ID)
    const [workerProfile] = await pool.query(
      'SELECT id, hourly_rate FROM worker_profiles WHERE user_id = ?',
      [workerId]
    );

    if (workerProfile.length === 0) {
      return res.status(400).json({ error: 'Invalid worker' });
    }

    const workerProfileId = workerProfile[0].id;
    const estimatedCost = workerProfile[0].hourly_rate * durationHours;

    const [result] = await pool.query(
      `INSERT INTO bookings (client_id, worker_id, service_id, booking_date, duration_hours, estimated_cost, location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, workerProfileId, serviceId, bookingDate, durationHours, estimatedCost, location, notes]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      estimatedCost,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.user;

    const [bookings] = await pool.query(
      `SELECT b.*, u.first_name, u.last_name, u.id as worker_user_id, sc.name as service_name,
              p.amount as payment_amount, p.status as payment_status, p.created_at as payment_date
       FROM bookings b
       LEFT JOIN worker_profiles wp ON b.worker_id = wp.id
       LEFT JOIN users u ON wp.user_id = u.id
       LEFT JOIN service_categories sc ON b.service_id = sc.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.client_id = ? OR wp.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId, userId]
    );

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, actualCost } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = [status];
    let updateQuery = 'UPDATE bookings SET status = ?';

    if (status === 'completed') {
      updateQuery += ', completed_at = NOW()';
      if (actualCost) {
        updateQuery += ', actual_cost = ?';
        updateData.push(actualCost);
      }
    }

    if (status === 'cancelled') {
      updateQuery += ', cancelled_at = NOW()';
    }

    updateQuery += ' WHERE id = ?';
    updateData.push(bookingId);

    await pool.query(updateQuery, updateData);

    res.json({ message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
};

// Get booking details
const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [bookings] = await pool.query(
      `SELECT b.*, c.first_name as client_first_name, c.last_name as client_last_name,
              u.first_name as worker_first_name, u.last_name as worker_last_name,
              sc.name as service_name
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       LEFT JOIN worker_profiles wp ON b.worker_id = wp.id
       LEFT JOIN users u ON wp.user_id = u.id
       LEFT JOIN service_categories sc ON b.service_id = sc.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: bookings[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking details', details: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getBookingDetails,
};
