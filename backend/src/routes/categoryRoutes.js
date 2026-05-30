const express = require('express');
const {
  getAllCategories,
  getWorkersByCategory,
  getCategoryById,
} = require('../controllers/categoryController');

const router = express.Router();

// Get all categories
router.get('/all', getAllCategories);

// Get category by ID
router.get('/:categoryId', getCategoryById);

// Get workers by category
router.get('/:categoryId/workers', getWorkersByCategory);

module.exports = router;
