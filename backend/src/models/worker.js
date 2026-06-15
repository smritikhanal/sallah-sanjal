// Worker model — query helpers for worker_profiles and worker data
const pool = require('../config/database');

const Worker = {
  findAll: async (filters = {}) => {
    const { category, location, minRating, page = 1, limit = 50 } = filters;
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
        GROUP_CONCAT(DISTINCT sc.name) as services
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN worker_services ws ON wp.id = ws.worker_id
      LEFT JOIN service_categories sc ON ws.service_id = sc.id
      WHERE u.role = 'worker' AND u.is_active = true
    `;
    const params = [];

    if (category) {
      query += ' AND sc.name LIKE ?';
      params.push(`%${category}%`);
    }
    if (location) {
      query += ' AND wp.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (minRating) {
      query += ' AND wp.average_rating >= ?';
      params.push(parseFloat(minRating));
    }

    query += ' GROUP BY u.id ORDER BY wp.average_rating DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  },

  findById: async (workerId) => {
    const [rows] = await pool.query(
      `SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email, 
        u.phone,
        u.profile_picture as image,
        wp.*
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      WHERE u.id = ? AND u.role = 'worker'`,
      [workerId]
    );
    return rows[0] || null;
  },

  findByUserId: async (userId) => {
    const [rows] = await pool.query(
      'SELECT * FROM worker_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  createProfile: async (data) => {
    const { userId, bio, location, hourlyRate } = data;
    const [result] = await pool.query(
      `INSERT INTO worker_profiles (user_id, bio, location, hourly_rate) VALUES (?, ?, ?, ?)`,
      [userId, bio, location, hourlyRate]
    );
    return result.insertId;
  },
};

module.exports = Worker;
