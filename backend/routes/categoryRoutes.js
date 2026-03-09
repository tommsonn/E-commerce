import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getCategories);

// Admin routes
router.post('/', protect, admin, createCategory);
router.post('/upload', protect, admin, uploadSingle, uploadCategoryImage);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;