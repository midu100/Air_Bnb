# Air_Bnb

A rental platform that runs three businesses on one listing: **short-term** stays priced
by the night, **mid-term** stays priced by the month, and **long-term** tenancies governed
by a signed lease.

Most rental products pick one of those. This one lets a host publish a property once and
sell it on any combination of the three, with the pricing, billing, paperwork and rules
switching to match.

```
short   1-29 nights     nightly rate    paid once           you get a reservation
mid     1-11 months     monthly rate    billed monthly      you get a furnished stay
long    12+ months      monthly rent    rent ledger         you get a signed lease
```

---

## Stack

**Server** — Node, Express 5, Mongoose 9, Socket.io, Stripe, JWT in httpOnly cookies,
Cloudinary, Nodemailer, Helmet, express-rate-limit.

**Client** — React 19, Vite 8, Tailwind v4, Redux Toolkit + RTK Query, React Router 7,
Leaflet, socket.io-client, react-icons, react-hot-toast.

---

## Features

### Every horizon

- Listings with photos, categories, amenities and per-horizon pricing
- Server-side search with debounce, pagination, and filters that follow the horizon
- Animated map view, click a price pin to open the property
- Real-time messaging over Socket.io
- Five interface languages including right-to-left Arabic, and ten display currencies
- Email OTP verification, forgot and reset password
- Host payouts through Stripe Connect with KYC, held until a day after check-in
- Two-way reviews with six category sub-ratings
- Host calendar with date blocking, plus iCal export and import so other channels
  cannot double-book a property

### Short-term

- Nightly pricing with seasonal and weekday rules resolved per night
- Length-of-stay discounts at seven and twenty-eight nights
- Minimum and maximum stay enforcement
- Four cancellation tiers with the refund computed from days of notice
- Occupancy tax collected on top and reported separately

### Mid-term

- Monthly pricing with a prorated part month at either end
- Utilities included flag with an optional cap
- Security deposit taken at checkout and returned in full on cancellation
- First month up front, the rest charged automatically month by month
- Extend or shorten an active stay, which re-prices and rebuilds the remaining plan
- Corporate billing so an employer or agency can be the payer rather than the occupant
- Workspace attributes (desk, monitor, measured wifi, in-unit laundry)

### Long-term

- Reusable rental application with co-applicants and a guarantor
- Explicit screening consent recorded with a timestamp and IP
- Landlord review, approve or decline with a reason
- Lease drafting, multi-party signature, and activation on the last signature
- Security deposit held, with its status visible throughout the tenancy
- Twelve-month rent ledger generated automatically when a lease activates
- Notice period recorded with the earliest lawful end date calculated

---

## Project structure

```
Air_Bnb/
├── server/
│   ├── controllers/     auth, property, booking, lease, application, payment,
│   │                    payout, availability, pricingRule, review, currency, ...
│   ├── models/          14 Mongoose models
│   ├── routes/          17 routers mounted in routes/index.js
│   ├── middleware/      auth, roleCheck, rateLimiters
│   ├── sevices/         pricingEngine, billingScheduler, icalService,
│   │                    currencyService, stripeConfig, email, cloudinary
│   ├── dbConfig/
│   ├── seed.js
│   └── index.js
└── client/
    └── src/
        ├── api/         axios instance
        ├── components/  shared, admin/, common/
        ├── i18n/        translations and LocaleContext
        ├── lib/         socket.js
        ├── pages/       public, guest, admin/
        ├── store/       apiSlice, api/ (RTK Query), slices/
        ├── layout/
        └── App.jsx
```

The pricing engine in `server/sevices/pricingEngine.js` is the single place that turns
dates into money for all three horizons. Nothing else calculates a price.

---

## Getting started

### Prerequisites

- Node 20 or newer
- A MongoDB connection string (Atlas or local)
- Optional: Cloudinary, Gmail SMTP and Stripe credentials

### Install and run

```bash
# Server
cd server
cp .env.example .env        # then fill it in
npm install
npm run seed                # demo users, categories, amenities, 14 properties
npm start                   # http://localhost:8000

# Client, in a second terminal
cd client
cp .env.example .env        # optional, defaults to localhost:8000
npm install
npm run dev                 # http://localhost:5173
```

### Demo accounts

Created by `npm run seed`:

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | `admin@airbnb.test`   | `Admin1234` |
| Host  | `host@airbnb.test`    | `Host1234`  |

Passwords are bcrypt hashed and cannot be read back out of the database. Use
`/forgot-password` to recover any other account.

### Stripe locally

Payments and payouts return `503 Payment gateway is not configured` until the keys are
set. To test the full flow:

```bash
stripe listen --forward-to localhost:8000/payment/webhook
```

Put the printed signing secret in `STRIPE_WEBHOOK_SECRET`. A booking is only ever marked
paid by the signed webhook, never by anything the browser reports.

---

## Scripts

| Location | Command | Does |
|----------|---------|------|
| server   | `npm start` | Runs the API with `node --watch` |
| server   | `npm run seed` | Seeds demo data, safe to run repeatedly |
| client   | `npm run dev` | Vite dev server |
| client   | `npm run build` | Production build |
| client   | `npm run lint` | ESLint |

---

## API overview

All routers are mounted in `server/routes/index.js`.

| Prefix | Covers |
|--------|--------|
| `/auth` | Signup, OTP, login, logout, refresh, forgot and reset password, profile |
| `/property` | CRUD, search, featured, host listings |
| `/booking` | Quote, create, extend, cancel with refund preview, installments |
| `/lease` | Quote, draft, sign, notice, ledger |
| `/application` | Apply, review, approve or decline, withdraw |
| `/payment` | Stripe checkout session, signed webhook, refunds |
| `/payout` | Connect onboarding, account status, transfer history |
| `/availability` | Calendar, date blocking, iCal export and import |
| `/pricing-rule` | Seasonal and weekday rate overrides |
| `/review` | Guest reviews of stays, host reviews of guests |
| `/wishlist`, `/category`, `/amenity`, `/currency` | Supporting resources |
| `/conversations`, `/api/messages` | Real-time messaging |

---

## Security

- Access and refresh tokens live in `httpOnly` cookies, so an XSS payload cannot read them
- `secure` and `sameSite` follow HTTPS automatically
- Roles are never taken from the request body at signup
- Property updates copy only whitelisted fields, so a host cannot alter ownership or ratings
- Every message route checks conversation membership
- Rate limiting on credential endpoints, Helmet headers, body size caps, upload type and
  size limits
- Payment amounts always come from the booking record, never from the client

---

## Deployment

`.github/workflows/deploy.yml` builds both images, pushes them to Amazon ECR, and deploys
to EC2 through SSM **on every push to `main`**.

Before the first deploy of this version, set these on the server environment:

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `CLIENT_URL` pointing at the deployed frontend
- `CLIENT_ORIGINS` with the deployed frontend origin, otherwise CORS blocks the browser
- `TRUST_PROXY=1` if a proxy or load balancer sits in front

---

## Roadmap

- Government ID verification through a provider
- Lease PDF generation and e-signature storage
- Maintenance requests with vendor dispatch
- Automated regulatory reporting for short-term rental registration and DAC7
