import express from 'express';
import {
  getCustomers,
  getCustomerStats,
  toggleAdminStatus,
  getCustomerById
} from '../controllers/adminCustomerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require admin
router.use(protect, admin);

router.get('/customers', getCustomers);
router.get('/customer-stats', getCustomerStats);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/toggle-admin', toggleAdminStatus);

export default router;