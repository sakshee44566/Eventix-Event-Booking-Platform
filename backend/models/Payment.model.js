import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'card'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    default: ''
  },
  stripeChargeId: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  receiptUrl: {
    type: String,
    default: ''
  },
  failureReason: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
// Note: paymentId already has unique index from schema definition
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Generate unique payment ID
paymentSchema.statics.generatePaymentId = function() {
  const prefix = 'PAY';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

