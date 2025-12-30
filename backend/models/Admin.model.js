import mongoose from 'mongoose';

// Admin is essentially a User with admin role, but we can extend this model
// for admin-specific features like permissions, activity logs, etc.

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  permissions: {
    createEvents: {
      type: Boolean,
      default: true
    },
    editEvents: {
      type: Boolean,
      default: true
    },
    deleteEvents: {
      type: Boolean,
      default: true
    },
    manageUsers: {
      type: Boolean,
      default: false
    },
    viewAnalytics: {
      type: Boolean,
      default: true
    },
    managePayments: {
      type: Boolean,
      default: false
    }
  },
  lastLogin: {
    type: Date
  },
  activityLog: [{
    action: String,
    resource: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index
adminSchema.index({ user: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

