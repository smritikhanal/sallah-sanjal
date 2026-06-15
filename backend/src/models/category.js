// Category model — query helpers for service_categories table
const pool = require('../config/database');

const Category = {
  findAll: async () => {
    const [rows] = await pool.query(
      'SELECT id, name, description, icon FROM service_categories ORDER BY name ASC'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, name, description, icon FROM service_categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  findWorkersByCategory: async (categoryId, { limit = 10, offset = 0 } = {}) => {
    const [rows] = await pool.query(
      `SELECT DISTINCT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) as name, 
        u.email, 
        u.phone,
        wp.bio,
        wp.hourly_rate,
        wp.average_rating,
        wp.experience_years,
        wp.is_verified
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      JOIN worker_services ws ON wp.id = ws.worker_id
      WHERE ws.service_id = ? AND u.role = 'worker' AND u.is_active = true
      ORDER BY wp.average_rating DESC, wp.experience_years DESC
      LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );
    return rows;
  },
};

module.exports = Category;
