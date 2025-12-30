import Stripe from 'stripe';
import Payment from '../models/Payment.model.js';
import Booking from '../models/Booking.model.js';
import Event from '../models/Event.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: 'Booking ID is required'
    });
  }

  // Get booking
  const booking = await Booking.findById(bookingId)
    .populate('event')
    .populate('user');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking
  if (booking.user._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this booking'
    });
  }

  // Check if booking is already paid
  if (booking.paymentStatus === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Booking is already paid'
    });
  }

  // Create or get existing payment
  let payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    payment = await Payment.create({
      paymentId: Payment.generatePaymentId(),
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalPrice,
      currency: booking.currency,
      paymentMethod: 'stripe',
      status: 'pending'
    });
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Convert to cents
    currency: booking.currency.toLowerCase(),
    metadata: {
      bookingId: booking.bookingId,
      paymentId: payment.paymentId,
      userId: req.user.id,
      eventId: booking.event._id.toString()
    },
    description: `Payment for booking ${booking.bookingId}`
  });

  // Update payment with Stripe payment intent ID
  payment.stripePaymentIntentId = paymentIntent.id;
  payment.status = 'processing';
  await payment.save();

  // Update booking with payment reference
  booking.payment = payment._id;
  await booking.save();

  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.paymentId,
      amount: booking.totalPrice,
      currency: booking.currency
    }
  });
});

// @desc    Confirm payment (webhook handler)
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Find payment by Stripe payment intent ID
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      // Update payment status
      payment.status = 'completed';
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id || '';
      payment.transactionId = paymentIntent.id;
      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url || '';
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'completed';
        booking.status = 'confirmed';

        // Update event ticket availability
        const event = await Event.findById(booking.event._id || booking.event);
        if (event) {
          try {
            const tier = event.ticketTiers.find(t => 
              t.id === booking.ticketTierId || t._id?.toString() === booking.ticketTierId
            );
            if (tier && tier.available >= booking.quantity) {
              tier.available -= booking.quantity;
              event.availableTickets -= booking.quantity;
              await event.save();
            }
          } catch (error) {
            console.error('Error updating event availability:', error);
          }
        }

        await booking.save();
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      await payment.save();

      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }
    }
  }

  res.json({ received: true });
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'name email')
    .lean();

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if user owns this payment or is admin
  if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this payment'
    });
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
export const getUserPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('booking')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

