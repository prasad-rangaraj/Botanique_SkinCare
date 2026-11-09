# BOTANIQUE — Botanical Skincare E-Commerce Platform

> **Rooted in Nature. Made for Your Ritual.**

A complete, production-oriented e-commerce website for BOTANIQUE, a botanical skincare brand based in Bengaluru, India.

---

## Project Structure

```
botanique-skincare/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript + Prisma
└── README.md
```

---

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- npm or pnpm

---

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE botanique_db;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials and other settings
# (See Environment Variables section below)

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (5 products + admin user + FAQs + shipping zones)
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens — change in production | ✅ |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay API key (test/live) | For payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | For payments |
| `EMAIL_HOST` | SMTP email host | For email |
| `EMAIL_PORT` | SMTP port | For email |
| `EMAIL_USER` | SMTP username | For email |
| `EMAIL_PASS` | SMTP password | For email |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `ADMIN_EMAIL` | Initial admin email | ✅ |
| `ADMIN_PASSWORD` | Initial admin password | ✅ |
| `AI_SUPPORT_API_URL` | AI chatbot API endpoint | Optional |
| `AI_SUPPORT_API_KEY` | AI chatbot API key | Optional |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |

---

## Default Admin Access

After seeding, the admin dashboard is available at `/admin`.

Default credentials (change immediately):
- Email: `admin@botanique.in`
- Password: `Admin@Botanique2024`

> ⚠️ Change the admin password before deploying to production.

---

## Product Catalogue

Five products are seeded into the database:

| Product | Size | Price |
|---|---|---|
| Rose Face Oil | 30 ml | ₹1,450 |
| Shea Repair Balm | 50 g | ₹850 |
| Aloe Calm Gel | 50 g | ₹650 |
| Vitamin Glow Serum | 30 ml | ₹1,100 |
| Herbal Lip Balm | 15 g | ₹350 |

All products are created as **unpublished drafts**. Review and publish them through the admin dashboard before the site goes live.

---

## Payment Integration (Razorpay)

Razorpay is integrated in test mode. To enable live payments:

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Obtain your Key ID and Key Secret from the dashboard
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`
4. Update `VITE_RAZORPAY_KEY_ID` in `frontend/.env`
5. For production, use live mode keys (prefix `rzp_live_`)

> Payment signatures are verified server-side. Orders are never marked as paid based on frontend responses alone.

---

## AI Support Chatbot

The chatbot uses a knowledge-base fallback when no AI API is configured. To connect an AI API:

1. Set `AI_SUPPORT_API_URL` in `backend/.env`
2. Set `AI_SUPPORT_API_KEY` in `backend/.env`

The chatbot will forward messages to the configured API. If unavailable, it falls back to the built-in knowledge base.

---

## Shipping Configuration

Default shipping zones are created during seeding:

- **Bengaluru**: Free delivery, 2–5 business days after fulfillment (estimated)
- **Rest of India**: ₹80, 4–8 business days after fulfillment (estimated)

> These are estimates under review and are not guaranteed delivery commitments. Manage shipping zones through the admin dashboard.

---

## Admin Dashboard

Access at `/admin` after logging in with an admin account.

Sections:
- **Dashboard**: Revenue, orders, customer statistics
- **Products**: Manage the product catalogue
- **Orders**: View and update order status, add shipment info
- **Customers**: Customer profiles and order history
- **Requests**: Review return, refund, and replacement requests
- **Settings**: Site settings, FAQs, shipping zones, categories

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with configurable expiry
- Rate limiting on all API endpoints
- Helmet security headers
- CORS restricted to configured frontend URL
- SQL injection protection through Prisma ORM
- Payment signatures verified server-side
- Admin routes protected by role-based middleware
- Audit logging for admin actions

---

## Content and Brand Guidelines

This platform follows strict brand communication rules:

- Product descriptions are based on working formulations only
- No ingredient concentrations are stated
- No clinical testing or dermatological approval claims
- No vegan claims for products containing Beeswax
- No invented certifications, reviews, or business details
- Safety notes and patch test reminders on all product pages
- Skincare guidance marked as general information, not medical advice
- Returns policy noted as proposed and pending approval

All product and business information must be reviewed and approved by the business before the site goes live. Use the admin dashboard to update content before publishing.

---

## Production Deployment Checklist

- [ ] Change admin password
- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to production domain
- [ ] Set up Razorpay live keys
- [ ] Configure email provider
- [ ] Review and publish products in admin dashboard
- [ ] Configure support email and phone in admin settings
- [ ] Review shipping zones and charges
- [ ] Review and approve returns policy content
- [ ] Enable announcement bar if needed
- [ ] Set up SSL/HTTPS
- [ ] Configure error monitoring

---

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query, Zustand, Axios, Lucide Icons

**Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, bcryptjs, JWT, Razorpay, express-validator, Helmet, Morgan

---

## License

© 2024 BOTANIQUE. All rights reserved.

