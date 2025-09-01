# Dr. José Gomes Medical Recovery Fund

A multilingual crowdfunding platform built with Next.js 15, TypeScript, and Stripe to support Dr. José Gomes' medical recovery.

## 🚀 Deployment

**Production URL:** https://dr-jose-gomes.vercel.app

**Vercel Project:** `dr-jose-gomes` (Organization: `dsgmcostas-projects`)

- Auto-deploys from GitHub `main` branch
- Project configured in `vercel.json`

## 🚀 Features Implemented

### Core Functionality

- ✅ **Multilingual Support** - Full English and Portuguese translations
- ✅ **Stripe Payment Integration** - Secure donation processing
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS v4
- ✅ **Real-time Progress Tracking** - Live donation updates and milestones
- ✅ **Social Sharing** - Facebook, Twitter, WhatsApp, and email sharing
- ✅ **Donation Certificates** - PDF generation for tax records

### Admin Features

- ✅ **Secure Admin Dashboard** - Protected authentication system
- ✅ **Donation Management** - View, filter, and export donations
- ✅ **Campaign Analytics** - Real-time stats and progress monitoring
- ✅ **CSV Export** - Download donation data for accounting

### Technical Features

- ✅ **Email Notifications** - Automated confirmation emails via Resend
- ✅ **Webhook Handling** - Stripe payment verification
- ✅ **SEO Optimization** - Sitemap, robots.txt, structured data
- ✅ **Security Headers** - CSP, HSTS, XSS protection
- ✅ **Google Analytics** - Event tracking and conversions
- ✅ **Rate Limiting** - API protection against abuse

## 📁 Project Structure

```
save-jose-gomes/
├── app/
│   ├── [locale]/            # Internationalized pages
│   │   ├── page.tsx          # Main landing page
│   │   ├── thank-you/        # Post-donation page
│   │   └── layout.tsx        # Locale-specific layout
│   ├── admin/                # Admin dashboard
│   │   ├── login/            # Admin authentication
│   │   └── dashboard/        # Campaign management
│   ├── api/                  # API endpoints
│   │   ├── donations/        # Donation processing
│   │   ├── webhooks/         # Stripe webhooks
│   │   └── admin/            # Admin APIs
│   ├── sitemap.ts            # SEO sitemap
│   └── robots.ts             # SEO robots.txt
├── components/
│   ├── admin/                # Admin components
│   ├── analytics/            # Google Analytics
│   ├── certificate/          # PDF certificates
│   ├── donation/             # Donation forms
│   ├── donations/            # Donation feed
│   ├── layout/               # Header, Footer
│   ├── progress/             # Campaign progress
│   ├── sections/             # Page sections
│   ├── seo/                  # SEO components
│   └── share/                # Share modals
├── lib/
│   ├── auth.ts               # Authentication
│   ├── db.ts                 # Database queries
│   ├── donations.ts          # Donation logic
│   ├── email.ts              # Email templates
│   ├── security.ts           # Security helpers
│   ├── stripe.ts             # Stripe config
│   └── utils/                # Utilities
├── messages/                 # i18n translations
│   ├── en.json               # English
│   └── pt.json               # Portuguese
├── scripts/
│   └── seed-donations.ts     # Mock data seeder
└── types/                    # TypeScript types
```

## 🛠 Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: Vercel Postgres
- **Payments**: Stripe
- **Email**: Resend
- **Auth**: Iron Session + bcrypt
- **i18n**: next-intl
- **Analytics**: Google Analytics 4
- **PDF**: React PDF Renderer

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Database
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
RESEND_API_KEY=re_...

# Auth
SESSION_SECRET=at-least-32-characters-long-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt_hash_here

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_CONVERSION_ID=AW-XXXXXXXXXX

# Site
NEXT_PUBLIC_SITE_URL=https://josegomes.fund
NEXT_PUBLIC_GOAL_AMOUNT=25000
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up database tables
npm run seed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Admin Access

Default admin credentials:

- Username: `admin`
- Password: `admin123`

**Important**: Change these in production by setting:

- `ADMIN_USERNAME` environment variable
- `ADMIN_PASSWORD_HASH` environment variable (use bcrypt to hash)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📝 API Endpoints

### Public APIs

- `POST /api/donations/create-checkout` - Create Stripe checkout session
- `GET /api/donations/recent` - Get recent public donations
- `GET /api/stats` - Get campaign statistics

### Admin APIs (Protected)

- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/export` - Export donations CSV

### Webhooks

- `POST /api/webhooks/stripe` - Stripe payment webhooks

## 🔒 Security Features

- **Authentication**: Secure session-based admin auth
- **HTTPS Only**: Enforced in production
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token validation
- **Rate Limiting**: API request limits
- **SQL Injection**: Parameterized queries

## 🌍 Internationalization

Supported languages:

- English (`/en`)
- Portuguese (`/pt`)

Add new languages by:

1. Create `messages/[locale].json`
2. Update `i18n/routing.ts`
3. Add locale to middleware

## 📊 Analytics Events

Tracked events:

- Donation initiated
- Donation completed
- Share button clicks
- Language switches
- Page views

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Security audit
npm audit
```

## 📧 Email Templates

- **Donation Confirmation**: Sent after successful payment
- **Campaign Updates**: Bulk updates to donors (manual)

## 🎨 Customization

### Modify Goal Amount

Update `NEXT_PUBLIC_GOAL_AMOUNT` in environment variables

### Change Colors

Edit theme in `tailwind.config.ts`

### Update Content

Edit translation files in `messages/` directory

## 🐛 Known Issues

- PDF generation may fail on some mobile browsers
- Language switcher requires page refresh on some routes

## 📮 Support

For issues or questions, contact the development team.

## 📄 License

Private project - All rights reserved

---

Built with ❤️ for Dr. José Gomes
