const pool = require('../config/database');

// Category controller — handles listing categories and workers by category

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

// Create a new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const [existing] = await pool.query('SELECT id FROM service_categories WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(409).json({ error: 'Category already exists' });

    const [result] = await pool.query(
      'INSERT INTO service_categories (name, description, icon) VALUES (?, ?, ?)',
      [name, description || '', icon || null]
    );
    res.status(201).json({ id: result.insertId, name, description, icon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
};

// Update an existing category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon } = req.body;

    const [existing] = await pool.query('SELECT id FROM service_categories WHERE id = ?', [categoryId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Category not found' });

    await pool.query(
      'UPDATE service_categories SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon) WHERE id = ?',
      [name || null, description !== undefined ? description : null, icon !== undefined ? icon : null, categoryId]
    );
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
};

// Delete a category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [existing] = await pool.query('SELECT id FROM service_categories WHERE id = ?', [categoryId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Category not found' });

    await pool.query('DELETE FROM service_categories WHERE id = ?', [categoryId]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
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
