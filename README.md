# KrishiConnect — Empowering Farmers, Connecting Agriculture

Multilingual (English / हिंदी / मराठी) Indian agricultural marketplace: buy, sell, rent equipment, exchange, free listings and buy-requests.

## Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL (Neon) · Drizzle ORM

## Run locally
```bash
npm install
cp .env.example .env.local   # set DATABASE_URL
npx drizzle-kit push --config=drizzle.config.ts
npm run dev
```
Local demo seed: `POST /api/seed` (creates demo@krishiconnect.in / demo1234 + sample listings). Do not use demo credentials in production.

## Environment variables (Replit Secrets / .env.local)
| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (sslmode=require) |
| `GOOGLE_APPS_SCRIPT_URL` | Optional: email/notification webhook |
| `GOOGLE_APPS_SCRIPT_SECRET` | Optional: webhook secret |

## Replit deployment
- Build: `npm run build` · Start: `npm run start` (Next listens on PORT, default 3000)
- Add `DATABASE_URL` in Replit Secrets, run `npx drizzle-kit push` once, then deploy.

## Features
- Auth (scrypt hashing, httpOnly session cookies), roles (farmer/supplier/equipment_owner/dealer/admin)
- 5 listing types, categories (admin-managed), image URLs + file upload (`/api/upload`)
- Purchase requests with quantity validation, rental booking with overlap prevention, exchange, free claims
- Messaging (polling), notifications, wishlist, reviews (completed transactions only), reports
- Admin dashboard: users, listings, categories, reports, reviews, audit logs
- Full EN/HI/MR i18n with localStorage + profile persistence, Devanagari font
- Voice search via Web Speech API (optional), location filters (state/district), sorting

## Security
Server-side authz on every route, ownership checks, parameterized Drizzle queries, pesticide listings require licence details and reject expired products. Payments are direct buyer-seller coordination — no card data stored.
