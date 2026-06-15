const express = require('express');
const {
  getAllCategories,
  getWorkersByCategory,
  getCategoryById,
} = require('../controllers/categoryController');

const router = express.Router();

// GET /api/categories/all — List all service categories
router.get('/all', getAllCategories);

// GET /api/categories/:categoryId — Get a single category
router.get('/:categoryId', getCategoryById);

// GET /api/categories/:categoryId/workers — List workers in a category
router.get('/:categoryId/workers', getWorkersByCategory);

module.exports = router;
