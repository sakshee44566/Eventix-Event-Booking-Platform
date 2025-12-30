import User from '../models/User.model.js';
import Booking from '../models/Booking.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = { user: req.user.id };

  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('event', 'title date time venue location image category')
    .sort({ bookingDate: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all bookings
  const allBookings = await Booking.find({ user: userId })
    .populate('event', 'title date time venue location image')
    .sort({ bookingDate: -1 })
    .lean();

  // Separate bookings
  const now = new Date();
  const upcoming = allBookings.filter(b => {
    const eventDate = new Date(b.event.date);
    return eventDate > now && b.status !== 'cancelled';
  });

  const past = allBookings.filter(b => {
    const eventDate = new Date(b.event.date);
    return eventDate <= now || b.status === 'cancelled';
  });

  // Calculate stats
  const totalSpent = allBookings
    .filter(b => b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBookings,
        upcomingBookings: upcoming.length,
        pastBookings: past.length,
        confirmedBookings,
        totalSpent
      },
      upcoming,
      past
    }
  });
});

