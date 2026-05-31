const pool = require('../config/database');

// Get all service categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, description FROM service_categories ORDER BY name ASC'
    );

    res.json(categories || []);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get workers by category
exports.getWorkersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Get workers who offer services in this category
    const [workers] = await pool.query(
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
      [categoryId, parseInt(limit), parseInt(offset)]
    );

    res.json(workers || []);
  } catch (error) {
    console.error('Get workers by category error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [category] = await pool.query(
      'SELECT id, name, description FROM service_categories WHERE id = ?',
      [categoryId]
    );

    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};
