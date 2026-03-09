import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  createProductWithImages,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  toggleProductActive,
  toggleProductFeatured
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getProducts);

router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.post('/', protect, admin, createProduct);
router.post('/with-images', protect, admin, uploadMultiple, createProductWithImages);
router.post('/upload', protect, admin, uploadMultiple, uploadProductImages);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.delete('/:productId/images/:imageIndex', protect, admin, deleteProductImage);
router.patch('/:id/toggle-active', protect, admin, toggleProductActive);
router.patch('/:id/toggle-featured', protect, admin, toggleProductFeatured);

export default router;