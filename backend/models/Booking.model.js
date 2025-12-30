import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  ticketTierId: {
    type: String,
    required: [true, 'Ticket tier is required']
  },
  ticketTierName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Maximum 10 tickets per booking']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  ticketCodes: [{
    type: String,
    required: true,
    unique: true
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
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
// Note: bookingId already has unique index from schema definition
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ status: 1, bookingDate: -1 });

// Generate unique booking ID
bookingSchema.statics.generateBookingId = function() {
  const prefix = 'EVT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Generate ticket codes
bookingSchema.statics.generateTicketCodes = function(bookingId, quantity) {
  const codes = [];
  for (let i = 0; i < quantity; i++) {
    const code = `${bookingId}-T${String(i + 1).padStart(3, '0')}`;
    codes.push(code);
  }
  return codes;
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled') {
    return false;
  }
  if (this.paymentStatus !== 'completed') {
    return false;
  }
  // Can cancel if event is more than 24 hours away
  const event = this.event;
  if (event && event.date) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    return hoursUntilEvent > 24;
  }
  return false;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

