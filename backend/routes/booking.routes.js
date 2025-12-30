import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBooking,
  cancelBooking,
  getBookingHistory
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/history', getBookingHistory);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

export default router;

