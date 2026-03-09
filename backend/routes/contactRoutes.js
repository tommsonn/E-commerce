import express from 'express';
import {
  submitContact,
  getContacts,
  getContactById,
  markAsRead,
  replyToMessage,
  deleteContact,
  getContactStats,
  getMyMessages,  
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/', submitContact);

// Customer route (protected)
router.get('/my-messages', protect, getMyMessages);

// Admin routes
router.get('/stats', protect, admin, getContactStats);
router.get('/', protect, admin, getContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/read', protect, admin, markAsRead);
router.post('/:id/reply', protect, admin, replyToMessage);
router.delete('/:id', protect, admin, deleteContact);

export default router;