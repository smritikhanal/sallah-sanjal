// Users model — query helpers for the users table
const pool = require('../config/database');

const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT id, email, first_name, last_name, phone, role, profile_picture, is_active FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async ({ email, password, firstName, lastName, phone, role, image }) => {
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, password, firstName, lastName, phone, role || 'client', image || null]
    );
    return result.insertId;
  },
};

module.exports = User;
