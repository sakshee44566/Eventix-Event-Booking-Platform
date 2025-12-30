Eventix – Event Booking Platform

Eventix is a full-stack **event booking and management web application** built using the **MERN stack**.
It allows users to browse and book events, while admins can create and manage events through a dedicated dashboard.

Inspired by real-world platforms like **Eventbrite** and **Ticketmaster**.

---

## ✨ Features

### User

* Browse and filter events
* View event details
* Book tickets securely
* Manage bookings
* JWT-based authentication
* Responsive UI

### Admin

* Admin dashboard
* Create, update, and delete events
* Manage ticket pricing and availability
* View basic event and revenue stats

---

## 🛠 Tech Stack

**Frontend**

* React (v18), TypeScript
* Vite, React Router
* Tailwind CSS, shadcn/ui
* TanStack Query, React Hook Form, Zod

**Backend**

* Node.js (v18+), Express
* MongoDB with Mongoose
* JWT Authentication, bcrypt
* Stripe (payments)
* Express Rate Limit, Helmet, CORS

---

## 📦 Local Setup

### Prerequisites

* Node.js v18+
* npm v9+
* MongoDB (local or Atlas)

---

### 1. Clone Repository

```bash
git clone <repo-url>
cd ticket-triumph-flow-main
```

---

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:8080`

---

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`

---

## 🔧 Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_key
FRONTEND_URL=http://localhost:8080
```

---

## 🔐 Admin Access

* Sign up as a normal user
* Update user role to `admin` in MongoDB
* Re-login to access admin dashboard

---

## 📡 Key API Routes

* `POST /api/auth/login`
* `GET /api/events`
* `POST /api/events` (admin)
* `POST /api/bookings`
* `POST /api/payments/create-intent`

---

## 👤 Author

**Sakshee**
B.Tech Computer Science Engineering
Full-Stack MERN Developer

