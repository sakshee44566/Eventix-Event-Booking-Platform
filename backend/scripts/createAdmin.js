import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get email from command line arguments
    const email = process.argv[2];
    const name = process.argv[3] || 'Admin User';

    if (!email) {
      console.error('Usage: node scripts/createAdmin.js <email> [name]');
      console.error('Example: node scripts/createAdmin.js admin@example.com "Admin Name"');
      process.exit(1);
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      await user.save();
      console.log(`✅ User ${email} has been updated to admin role`);
    } else {
      // Create new admin user
      // Note: You'll need to set password manually or use a default
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      
      user = await User.create({
        name,
        email,
        password: defaultPassword,
        role: 'admin'
      });
      console.log(`✅ Admin user created: ${email}`);
      console.log(`⚠️  Default password: ${defaultPassword}`);
      console.log(`⚠️  Please change the password after first login!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

