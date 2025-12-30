import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { signupValidator, loginValidator } from '../validators/auth.validator.js';
import { validate } from '../middleware/validator.middleware.js';

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;

