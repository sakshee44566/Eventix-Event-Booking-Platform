# Event Booking System - Backend API

Production-ready backend for an Event Booking System built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - User signup and login
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt

- **Event Management**
  - Create, read, update, delete events (Admin only)
  - Multiple ticket tiers per event
  - Real-time availability tracking
  - Event filtering and search
  - Calendar-based event scheduling

- **Booking System**
  - Create bookings with ticket selection
  - Real-time availability checking
  - Prevent overbooking
  - Generate unique booking IDs and ticket codes
  - Booking cancellation with refund logic

- **Payment Integration**
  - Stripe payment processing
  - Payment intent creation
  - Webhook handling for payment confirmation
  - Refund support

- **User Features**
  - View booked events
  - Cancel bookings
  - Booking history (upcoming/past)
  - User dashboard with statistics

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   - MongoDB connection string
   - JWT secret key
   - Stripe API keys
   - Frontend URL for CORS

3. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## 📝 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Events
- `GET /api/events` - Get all events (Public)
  - Query params: `category`, `city`, `search`, `minPrice`, `maxPrice`, `isOnline`, `isFeatured`, `page`, `limit`, `sort`
- `GET /api/events/:id` - Get single event (Public)
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `GET /api/events/admin/all` - Get all events by admin (Admin only)

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings` - Get user bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)
- `GET /api/bookings/history` - Get booking history (Protected)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent (Protected)
- `POST /api/payments/webhook` - Stripe webhook handler (Public)
- `GET /api/payments` - Get user payments (Protected)
- `GET /api/payments/:id` - Get payment details (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `GET /api/users/bookings` - Get user bookings (Protected)
- `GET /api/users/dashboard` - Get user dashboard stats (Protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📊 Database Models

### User
- User authentication and profile information
- Role-based access (user/admin)

### Event
- Event details with multiple ticket tiers
- Availability tracking
- Calendar-based scheduling

### Booking
- Booking information linked to user and event
- Ticket codes generation
- Status tracking (pending, confirmed, cancelled)

### Payment
- Payment processing with Stripe
- Transaction tracking
- Refund support

### Admin
- Admin-specific permissions and activity logs

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- Rate limiting
- Helmet for security headers
- CORS configuration
- Error handling middleware
- Protected admin routes

## 📋 Request/Response Examples

### Signup
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Create Booking
```json
POST /api/bookings
Authorization: Bearer <token>
{
  "eventId": "event_id",
  "ticketTierId": "tier_id",
  "quantity": 2
}

Response:
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": { ... },
    "paymentRequired": 187.20
  }
}
```

## 🧪 Testing

The API can be tested using tools like:
- Postman
- Insomnia
- curl
- Frontend application

## 📝 Notes

- All timestamps are in ISO 8601 format
- Prices are stored as numbers (not strings)
- Service fee is calculated as 5% of subtotal
- Bookings can be cancelled if event is more than 24 hours away
- Payment webhook must be configured in Stripe dashboard

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📄 License

ISC

