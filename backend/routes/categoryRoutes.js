import express from 'express';
import {
  getCategories,
  createCategory,
  uploadCategoryImage,
  updateCategory,
  deleteCategory,
  debugListFiles  // Add this import
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', protect, admin, createCategory);
router.post('/upload', protect, admin, uploadSingle, uploadCategoryImage);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

// Debug route (remove after debugging)
router.get('/debug/files', protect, admin, debugListFiles);

export default router;
