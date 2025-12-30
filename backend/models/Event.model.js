import mongoose from 'mongoose';

const ticketTierSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Ticket tier name is required']
  },
  price: {
    type: Number,
    required: [true, 'Ticket tier price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    default: ''
  },
  available: {
    type: Number,
    required: true,
    min: [0, 'Available tickets cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total tickets cannot be negative']
  },
  perks: [{
    type: String
  }]
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['music', 'tech', 'business', 'education', 'sports', 'arts'],
    lowercase: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'Event end time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Event city is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  organizerLogo: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  availableTickets: {
    type: Number,
    required: true,
    min: [0, 'Available tickets cannot be negative']
  },
  totalTickets: {
    type: Number,
    required: true,
    min: [0, 'Total tickets cannot be negative']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  ticketTiers: {
    type: [ticketTierSchema],
    required: [true, 'At least one ticket tier is required'],
    validate: {
      validator: function(tiers) {
        return tiers && tiers.length > 0;
      },
      message: 'At least one ticket tier is required'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
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
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ isFeatured: 1, date: 1 });
eventSchema.index({ status: 1, date: 1 });

// Virtual to calculate total booked tickets
eventSchema.virtual('bookedTickets').get(function() {
  return this.totalTickets - this.availableTickets;
});

// Method to check if event is available
eventSchema.methods.isAvailable = function() {
  return this.status === 'published' && 
         this.availableTickets > 0 && 
         new Date(this.date) > new Date();
};

// Method to update ticket availability
eventSchema.methods.updateAvailability = async function(tierId, quantity) {
  const tier = this.ticketTiers.find(t => 
    t.id === tierId || t._id?.toString() === tierId
  );
  if (!tier) {
    throw new Error('Ticket tier not found');
  }
  if (tier.available < quantity) {
    throw new Error('Insufficient tickets available');
  }
  
  tier.available -= quantity;
  this.availableTickets -= quantity;
  await this.save();
  return this;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;

