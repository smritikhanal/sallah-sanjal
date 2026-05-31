const pool = require('../config/database');

// Get all workers with optional filtering
const getAllWorkers = async (req, res) => {
  try {
    const { category, location, minRating, service_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone,
        u.profile_picture as image,
        wp.id as profile_id,
        wp.bio, 
        wp.hourly_rate, 
        wp.average_rating, 
        wp.experience_years, 
        wp.location,
        wp.total_bookings,
        wp.is_verified,
        GROUP_CONCAT(DISTINCT sc.name) as services,
        GROUP_CONCAT(DISTINCT sc.name) as category
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN worker_services ws ON wp.id = ws.worker_id
      LEFT JOIN service_categories sc ON ws.service_id = sc.id
      WHERE u.role = 'worker' AND u.is_active = TRUE
    `;
    let params = [];

    if (service_id) {
      query += ` AND ws.service_id = ?`;
      params.push(service_id);
    }

    if (category) {
      query += ` AND sc.name LIKE ?`;
      params.push(`%${category}%`);
    }

    if (location) {
      query += ` AND wp.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (minRating) {
      query += ` AND wp.average_rating >= ?`;
      params.push(minRating);
    }

    query += ` GROUP BY u.id, wp.id ORDER BY wp.average_rating DESC, wp.experience_years DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [workers] = await pool.query(query, params);

    // Format response to match frontend expectations
    const formattedWorkers = workers.map(worker => ({
      id: worker.id,
      profile_id: worker.profile_id,
      first_name: worker.first_name,
      last_name: worker.last_name,
      name: `${worker.first_name} ${worker.last_name}`,
      email: worker.email,
      phone: worker.phone,
      bio: worker.bio,
      hourly_rate: parseFloat(worker.hourly_rate) || 500,
      average_rating: parseFloat(worker.average_rating) || 0,
      experience_years: worker.experience_years || 0,
      location: worker.location || 'N/A',
      total_bookings: worker.total_bookings || 0,
      is_verified: worker.is_verified,
      category: worker.category || 'Service',
      services: worker.services ? worker.services.split(',') : [],
      image: worker.image || null,
      qr_code: worker.qr_code || null,
      shift: 'Full-time',
      salary: (parseFloat(worker.hourly_rate) || 500) * 80,
    }));

    res.json(formattedWorkers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers', details: error.message });
  }
};

// Get worker profile by ID
const getWorkerProfile = async (req, res) => {
  try {
    const { workerId } = req.params;

    // Look up by user_id so URLs like /workers/14 work correctly
    const [workers] = await pool.query(
      `SELECT wp.*, u.first_name, u.last_name, u.email, u.phone, u.profile_picture
       FROM worker_profiles wp
       JOIN users u ON wp.user_id = u.id
       WHERE wp.user_id = ?`,
      [workerId]
    );

    if (workers.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const worker = workers[0];
    const wpId = worker.id; // worker_profiles.id (e.g. 1) — used for joins below

    // Get services via worker_profiles.id
    const [services] = await pool.query(
      `SELECT sc.* FROM service_categories sc
       JOIN worker_services ws ON sc.id = ws.service_id
       WHERE ws.worker_id = ?`,
      [wpId]
    );

    // Get reviews via worker_profiles.id
    const [reviews] = await pool.query(
      `SELECT r.*, u.first_name, u.last_name FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.worker_id = ?
       ORDER BY r.created_at DESC LIMIT 10`,
      [wpId]
    );

    // Parse JSON fields stored as text in the DB
    let scheduleAvailability = {};
    let scheduleTime = {};

    try {
      if (worker.schedule_availability) {
        scheduleAvailability = JSON.parse(worker.schedule_availability);
      }
    } catch (e) {
      scheduleAvailability = {};
    }

    try {
      if (worker.schedule_time) {
        scheduleTime = JSON.parse(worker.schedule_time);
      }
    } catch (e) {
      scheduleTime = {};
    }

    res.json({
      worker: {
        ...worker,
        schedule_availability: scheduleAvailability,
        schedule_time: scheduleTime,
      },
      services,
      reviews,
    });
  } catch (error) {
    console.error('getWorkerProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch worker profile', details: error.message });
  }
};

// Create/Update worker profile
const createWorkerProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { bio, location, latitude, longitude, hourlyRate, experienceYears } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE worker_profiles 
         SET bio = ?, location = ?, latitude = ?, longitude = ?, hourly_rate = ?, experience_years = ?
         WHERE user_id = ?`,
        [bio, location, latitude, longitude, hourlyRate, experienceYears, userId]
      );
    } else {
      // Create
      await pool.query(
        `INSERT INTO worker_profiles (user_id, bio, location, latitude, longitude, hourly_rate, experience_years)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, bio, location, latitude, longitude, hourlyRate, experienceYears]
      );
    }

    res.json({ message: 'Worker profile saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save worker profile', details: error.message });
  }
};

// Update worker profile
const updateWorkerProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      name,
      first_name,
      last_name,
      phone,
      location,
      hourlyRate,
      bio,
      image,
      profile_image,
        scheduleAvailability,
        scheduleTime,
        qr_code,
        bank_name,
        bank_account_name,
        bank_account_number,
        verification_document,
    } = req.body;

    const [workerProfile] = await pool.query(
      'SELECT id, bio, location, hourly_rate FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    if (workerProfile.length === 0) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    let firstName = first_name;
    let lastName = last_name;
    if (name && !first_name && !last_name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const imagePath = profile_image || image || null;
    const currentProfile = workerProfile[0];

    await pool.query(
      'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), image = COALESCE(?, image) WHERE id = ?',
      [firstName, lastName, phone, imagePath, userId]
    );

    const availabilityValue = scheduleAvailability ? JSON.stringify(scheduleAvailability) : null;
    const scheduleValue = scheduleTime ? JSON.stringify(scheduleTime) : null;

    await pool.query(
      `UPDATE worker_profiles
       SET bio = ?,
           location = ?,
           hourly_rate = ?,
           schedule_availability = COALESCE(?, schedule_availability),
           schedule_time = COALESCE(?, schedule_time),
           qr_code = COALESCE(?, qr_code),
           bank_name = COALESCE(?, bank_name),
           bank_account_name = COALESCE(?, bank_account_name),
           bank_account_number = COALESCE(?, bank_account_number),
           verification_document = COALESCE(?, verification_document)
       WHERE user_id = ?`,
      [
        bio ?? currentProfile.bio,
        location ?? currentProfile.location,
        hourlyRate ?? currentProfile.hourly_rate,
        availabilityValue,
        scheduleValue,
        qr_code || null,
        bank_name || null,
        bank_account_name || null,
        bank_account_number || null,
        verification_document || null,
        userId,
      ]
    );

    res.json({ message: 'Worker profile updated successfully' });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({ error: 'Failed to update worker profile', details: error.message });
  }
};

// Add service to worker
const addServiceToWorker = async (req, res) => {
  try {
    const { userId } = req.user;
    const { serviceId, serviceDescription } = req.body;

    const [worker] = await pool.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    if (worker.length === 0) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    await pool.query(
      'INSERT INTO worker_services (worker_id, service_id, service_description) VALUES (?, ?, ?)',
      [worker[0].id, serviceId, serviceDescription]
    );

    res.json({ message: 'Service added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add service', details: error.message });
  }
};

// Get current authenticated worker's profile
const getCurrentWorkerProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // First check if worker profile exists
    const [workerProfile] = await pool.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    // If no worker profile exists, create a default one
    if (workerProfile.length === 0) {
      await pool.query(
        `INSERT INTO worker_profiles (user_id, bio, hourly_rate, experience_years, location, average_rating, total_bookings, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'Professional Services', 500, 0, 'Nepal', 0, 0, false]
      );
    }

    const [workerData] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.profile_picture, wp.*, 
              GROUP_CONCAT(sc.name) as services
       FROM users u
       JOIN worker_profiles wp ON u.id = wp.user_id
       LEFT JOIN worker_services ws ON wp.id = ws.worker_id
       LEFT JOIN service_categories sc ON ws.service_id = sc.id
       WHERE u.id = ? AND u.role = 'worker'
       GROUP BY wp.id`,
      [userId]
    );

    if (workerData.length === 0) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    res.json({ data: workerData[0] });
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    res.status(500).json({ error: 'Failed to fetch worker profile', details: error.message });
  }
};

// Get worker's bookings
const getWorkerBookings = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get worker profile ID first
    const [workerProfile] = await pool.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    // If no worker profile, return empty bookings
    if (workerProfile.length === 0) {
      return res.json({ data: [] });
    }

    const workerProfileId = workerProfile[0].id;

    const [bookings] = await pool.query(
      `SELECT b.*, c.first_name, c.last_name, c.email as client_email, c.phone as client_phone
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       WHERE b.worker_id = ?
       ORDER BY b.created_at DESC`,
      [workerProfileId]
    );

    res.json({ data: bookings || [] });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.json({ data: [] });
  }
};

// Get reviews for worker
const getWorkerReviews = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get worker profile ID first
    const [workerProfile] = await pool.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [userId]
    );

    // If no worker profile, return empty reviews
    if (workerProfile.length === 0) {
      return res.json({ data: [] });
    }

    const workerProfileId = workerProfile[0].id;

    const [reviews] = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.email
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.worker_id = ?
       ORDER BY r.created_at DESC`,
      [workerProfileId]
    );

    res.json({ data: reviews || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.json({ data: [] });
  }
};

// Create a testimonial for the worker
const createTestimonial = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, content, rating } = req.body;

    if (!title || !content || !rating) {
      return res.status(400).json({ error: 'Title, content, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const [result] = await pool.query(
      'INSERT INTO testimonials (user_id, title, content, rating, is_visible) VALUES (?, ?, ?, ?, ?)',
      [userId, title, content, rating, false]
    );

    res.status(201).json({
      message: 'Testimonial created successfully',
      testimonialId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial', details: error.message });
  }
};

// Get worker's testimonials
const getWorkerTestimonials = async (req, res) => {
  try {
    const { userId } = req.user;

    const [testimonials] = await pool.query(
      `SELECT id, title, content, rating, is_visible, created_at, updated_at
       FROM testimonials
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ data: testimonials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials', details: error.message });
  }
};

// Update testimonial
const updateTestimonial = async (req, res) => {
  try {
    const { userId } = req.user;
    const { testimonialId } = req.params;
    const { title, content, rating } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify ownership
    const [testimonial] = await pool.query(
      'SELECT user_id FROM testimonials WHERE id = ?',
      [testimonialId]
    );

    if (testimonial.length === 0 || testimonial[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this testimonial' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (rating) {
      updates.push('rating = ?');
      params.push(rating);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(testimonialId);

    await pool.query(
      `UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial', details: error.message });
  }
};

// Delete testimonial
const deleteTestimonial = async (req, res) => {
  try {
    const { userId } = req.user;
    const { testimonialId } = req.params;

    // Verify ownership
    const [testimonial] = await pool.query(
      'SELECT user_id FROM testimonials WHERE id = ?',
      [testimonialId]
    );

    if (testimonial.length === 0 || testimonial[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this testimonial' });
    }

    await pool.query('DELETE FROM testimonials WHERE id = ?', [testimonialId]);

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial', details: error.message });
  }
};

module.exports = {
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
};
