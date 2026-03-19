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

// Public route - anyone can submit contact form
router.post('/', submitContact);

// Customer route (protected) - Get user's own messages
router.get('/my-messages', protect, getMyMessages);

// Protected route for viewing a single message (accessible to owner or admin)
router.get('/:id', protect, getContactById);

// Protected route for marking as read (accessible to owner or admin)
router.put('/:id/read', protect, markAsRead);

// Admin only routes
router.get('/stats', protect, admin, getContactStats);
router.get('/', protect, admin, getContacts);
router.post('/:id/reply', protect, admin, replyToMessage);
router.delete('/:id', protect, admin, deleteContact);

export default router;
