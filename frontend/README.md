# RailBook — Railway Booking System Frontend

A modern, full-stack Railway Booking Web Application built with **React 18 + TypeScript + Tailwind CSS**, connecting to your Spring Boot microservices backend.

---

## 🚀 Quick Start

> **Prerequisite:** Node.js v18+ and npm must be installed.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

The `.env` file is already created. Update your **Stripe publishable key** if needed:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> The dev server automatically proxies `/api/*` requests to `http://localhost:8080` (your API Gateway), so make sure your Spring Boot backend is running.

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/           # Axios instances + JWT interceptors
│   ├── components/    # Reusable UI components
│   │   ├── booking/   # PassengerForm, JourneySummary, TicketPDF
│   │   ├── layout/    # Navbar, Footer
│   │   ├── payment/   # StripePayment
│   │   └── search/    # TrainSearchWidget
│   ├── pages/
│   │   ├── admin/     # Dashboard, Users, Trains management
│   │   ├── auth/      # Login, Register
│   │   ├── booking/   # BookingWizard (multi-step)
│   │   ├── payment/   # Success page
│   │   ├── public/    # Home, SearchResults
│   │   ├── tatkal/    # Tatkal booking section
│   │   └── user/      # MyBookings dashboard
│   ├── store/         # Zustand stores (auth, booking)
│   ├── types/         # TypeScript interfaces (matches backend DTOs)
│   └── lib/           # Utility functions
├── .env               # Environment variables
├── tailwind.config.js # Tailwind + custom color palette
├── vite.config.ts     # Vite config + API proxy
└── package.json       # Dependencies
```

---

## 🔑 Key APIs Used

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/users/me` | Fetch current user profile |
| `GET /api/trains/search` | Search train schedules |
| `POST /api/bookings` | Create a booking |
| `GET /api/bookings/user` | Get user's bookings |
| `POST /api/payments/initiate` | Create Stripe PaymentIntent |
| `GET /api/payments/verify` | Verify payment after Stripe confirmation |

---

## 🎨 Design System

- **Primary:** Navy Blue `#0F2D5E`
- **Secondary/Accent:** Amber `#F97316`
- **Font:** Inter (Google Fonts)
- **UI Library:** Tailwind CSS v3 + shadcn/ui components
- **Animations:** Framer Motion

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## ⚠️ Notes

- Make sure your Spring Boot backend (API Gateway on port `8080`) is running before starting the frontend.
- Replace `pk_test_your_stripe_key_here` in `.env` with your actual Stripe publishable key.
- Admin routes (`/admin/*`) are protected and only accessible to users with `role: ADMIN`.
