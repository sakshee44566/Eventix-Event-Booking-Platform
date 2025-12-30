import express from 'express';
import {
  getUserProfile,
  getUserBookings,
  getUserDashboard
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/profile', getUserProfile);
router.get('/bookings', getUserBookings);
router.get('/dashboard', getUserDashboard);

export default router;

