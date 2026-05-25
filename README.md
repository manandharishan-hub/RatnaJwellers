# Ratna Jewels

Ratna Jewels is a Next.js ecommerce app for browsing jewellery, saving wishlist items, managing a cart, checking out with eSewa, tracking orders, and administering products/orders.

## Stack

- Next.js App Router
- TypeScript
- MongoDB with Mongoose
- NextAuth credentials auth
- Tailwind CSS
- eSewa checkout
- Firebase/Admin upload support

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the values used by the app:

```bash
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin123@gmail.com
ADMIN_PASSWORD=admin123
EMAIL_VERIFICATION_REQUIRED=false
ESEWA_ENV=sandbox
ESEWA_PRODUCT_CODE=
ESEWA_SECRET_KEY=
```

3. Start development:

```bash
npm run dev
```

4. Seed data when needed:

```bash
npm run db:seed
```

## Main Flows

- `/` redirects to the user dashboard flow.
- Logged-out customers are redirected to `/login` for account, cart, wishlist, checkout, and dashboard pages.
- Cart and wishlist actions require login and sync to MongoDB.
- Checkout uses eSewa only; orders are created after verified eSewa payment.
- Admin pages require the configured admin credentials.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run test:e2e
```
