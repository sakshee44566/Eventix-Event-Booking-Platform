import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminEvents
} from '../controllers/event.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { createEventValidator } from '../validators/event.validator.js';
import { validate } from '../middleware/validator.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAdminEvents);
router.post('/', protect, authorize('admin'), createEventValidator, validate, createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router;

