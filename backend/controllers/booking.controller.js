import Booking from '../models/Booking.model.js';
import Event from '../models/Event.model.js';
import Payment from '../models/Payment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { eventId, ticketTierId, quantity } = req.body;

  // Validate input
  if (!eventId || !ticketTierId || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Please provide eventId, ticketTierId, and quantity'
    });
  }

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be between 1 and 10'
    });
  }

  // Get event
  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (!event.isAvailable()) {
    return res.status(400).json({
      success: false,
      message: 'Event is not available for booking'
    });
  }

  // Find ticket tier
  const ticketTier = event.ticketTiers.find(tier => 
    tier.id === ticketTierId || tier._id?.toString() === ticketTierId
  );

  if (!ticketTier) {
    return res.status(404).json({
      success: false,
      message: 'Ticket tier not found'
    });
  }

  // Check availability
  if (ticketTier.available < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${ticketTier.available} tickets available for this tier`
    });
  }

  // Calculate prices
  const unitPrice = ticketTier.price;
  const subtotal = unitPrice * quantity;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const totalPrice = subtotal + serviceFee;

  // Generate booking ID and ticket codes
  const bookingId = Booking.generateBookingId();
  const ticketCodes = Booking.generateTicketCodes(bookingId, quantity);

  // Create booking
  const booking = await Booking.create({
    bookingId,
    user: req.user.id,
    event: eventId,
    ticketTierId,
    ticketTierName: ticketTier.name,
    quantity,
    unitPrice,
    serviceFee,
    totalPrice,
    currency: event.currency,
    ticketCodes,
    status: 'pending',
    paymentStatus: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      booking: await Booking.findById(booking._id)
        .populate('event', 'title date time venue location image')
        .populate('user', 'name email'),
      paymentRequired: totalPrice
    }
  });
});

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = { user: req.user.id };

  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('event', 'title date time venue location image category')
    .populate('user', 'name email')
    .sort({ bookingDate: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event')
    .populate('user', 'name email')
    .populate('payment')
    .lean();

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking or is admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Check if booking can be cancelled
  if (!booking.canBeCancelled()) {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be cancelled. Event is less than 24 hours away or already cancelled.'
    });
  }

  // Update booking status
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason || 'Cancelled by user';

  // Refund tickets to event
  const event = await Event.findById(booking.event._id || booking.event);
  if (event) {
    const tier = event.ticketTiers.find(t => 
      t.id === booking.ticketTierId || t._id?.toString() === booking.ticketTierId
    );
    
    if (tier) {
      tier.available += booking.quantity;
      event.availableTickets += booking.quantity;
      await event.save();
    }
  }

  // Update payment status if payment exists
  if (booking.payment) {
    const payment = await Payment.findById(booking.payment);
    if (payment && payment.status === 'completed') {
      payment.status = 'refunded';
      payment.refundAmount = booking.totalPrice;
      payment.refundedAt = new Date();
      payment.refundReason = booking.cancellationReason;
      await payment.save();
    }
    booking.paymentStatus = 'refunded';
    booking.refundAmount = booking.totalPrice;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

// @desc    Get booking history
// @route   GET /api/bookings/history
// @access  Private
export const getBookingHistory = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('event', 'title date time venue location image category')
    .sort({ bookingDate: -1 })
    .lean();

  // Separate into upcoming and past
  const now = new Date();
  const upcoming = bookings.filter(b => {
    const eventDate = new Date(b.event.date);
    return eventDate > now && b.status !== 'cancelled';
  });

  const past = bookings.filter(b => {
    const eventDate = new Date(b.event.date);
    return eventDate <= now || b.status === 'cancelled';
  });

  res.status(200).json({
    success: true,
    data: {
      upcoming,
      past,
      all: bookings
    }
  });
});

