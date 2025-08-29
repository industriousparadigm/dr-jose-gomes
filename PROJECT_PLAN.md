# Save Dr. José Gomes - Crowdfunding Platform Architecture

## Mission
Build a high-conversion crowdfunding platform for Dr. José Gomes de Oliveira's stroke recovery treatment. Target: $25,000 USD. Platform must evoke emotion, build trust, and minimize payment friction across 4 countries.

## MVP Scope (Soft Launch Ready)
- **Dual language** (PT/EN) from day one with auto-detection
- **Multiple payment methods**: Stripe (cards), PayPal, PIX (Brazil), MB Way (Portugal)
- **Admin panel** for transaction monitoring and posting updates
- **Anonymous donations** allowed for zero friction
- **Basic privacy** compliance (simple disclaimer, no complex GDPR)
- **No cryptocurrency** in MVP (deferred to phase 2)
- **Email capture** but no email sending initially (store for later)

## Core Principles
- **Emotion-First Design**: Every pixel should tell his story
- **Zero Friction**: Anonymous donations allowed, minimal required fields
- **Radical Transparency**: Weekly family updates, live donation counter
- **Trust Through Simplicity**: Basic privacy disclaimer, no complex compliance
- **Global Yet Personal**: Dual language (PT/EN), localized payment methods

## Technical Architecture

### Stack Decision
- **Next.js 14** (App Router) + **TypeScript**
- **Vercel** hosting (helpjosegomes.vercel.app → custom domain)
- **Supabase** for data layer (donations, updates, analytics)
- **Tailwind CSS** + **Radix UI** for accessible components
- **Framer Motion** for meaningful micro-interactions
- **React Hook Form** + **Zod** for type-safe forms

### Database Schema
```typescript
// Simplified schema for clarity
donations {
  id: uuid
  amount: decimal
  currency: enum('USD', 'BRL', 'EUR')
  payment_method: string
  donor_name?: string
  donor_message?: string
  is_anonymous: boolean
  created_at: timestamp
  ip_country: string
}

updates {
  id: uuid
  title_pt: string
  title_en: string
  content_pt: text (markdown)
  content_en: text (markdown)
  media_urls?: string[]
  author: string
  created_at: timestamp
  is_pinned: boolean
}

analytics_events {
  event_type: string
  properties: jsonb
  session_id: string
  created_at: timestamp
}

```

## Transaction Logging & Data Persistence

### Three-Layer Protection Against Data Loss

#### Layer 1: Primary Database (Supabase)
- Every donation immediately written to PostgreSQL
- Transaction-wrapped to ensure atomicity
- Includes full payment processor response
- Row-level security for data protection

#### Layer 2: Audit Log (Immutable)
```typescript
audit_logs {
  id: uuid
  event_type: string // donation_initiated, payment_captured, etc
  timestamp: timestamp
  data: jsonb // Complete event data
  hash: string // SHA-256 chain for tamper detection
}
```

#### Layer 3: External Backup
- Daily CSV export to Google Sheets or S3
- Webhook to Airtable for real-time backup
- Email notifications for high-value donations (>$500)

### Transaction Recovery Strategy
```typescript
// Daily reconciliation job
// Compares Stripe/PayPal records with database
// Auto-recovers any missing transactions
// Sends alert if discrepancies found
```

### Cryptocurrency Strategy
- **Not included in MVP** per requirements
- Deferred to phase 2 after soft launch validation

## Payment Architecture

### Environment Configuration
```env
# Stripe (handles US, EU, Cards globally)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Brazil - PIX via Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Portugal - MB Way
MBWAY_API_KEY=
MBWAY_ENTITY=

# PayPal (backup for all regions)
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=

# Cryptocurrency (Not in MVP)
# BTC_ADDRESS=
# LIGHTNING_ADDRESS=

# Bank Details (for manual transfers)
BANK_BRAZIL_PIX_KEY=
BANK_USA_ROUTING=
BANK_USA_ACCOUNT=
BANK_EUR_IBAN=
```

### Payment Flow by Region

**🇧🇷 Brazil Priority Stack:**
1. PIX (instant, zero fees) - Show QR + copy code
   - Provider: Mercado Pago
   - PIX Key Type: [NEEDS CLARIFICATION: CPF/Phone/Email]
2. Credit Cards via Stripe
3. Direct bank transfer instructions

**🇺🇸 USA Priority Stack:**
1. Stripe Checkout (cards, Apple/Google Pay)
2. PayPal/Venmo
3. Zelle instructions (manual)

**🇪🇺 Germany/Portugal Stack:**
1. MB Way (Portugal only)
2. SEPA transfer via Stripe
3. PayPal (high trust in EU)
4. Credit cards

**🌍 Crypto Stack:**
- Display addresses as QR codes
- Copy-to-clipboard functionality
- Show current USD equivalent
- No conversion, hold as crypto

## Legal & Financial Structure

### Personal Gift Model (No Entity Required)
- **Account Holder**: [NEEDS IMMEDIATE CLARIFICATION - specific person required]
  - Must decide: Alexandra (daughter) or specific family member
  - Account holder must understand tax implications
  - Need legal acknowledgment from chosen person
- **Structure**: Personal crowdfunding, no company entity
- **Fund Flow**: Wise → Direct medical payments or PayPal to Sarah (Brazil)
- **Privacy**: Basic disclaimer only, no complex GDPR implementation
- **Disclaimer**: "Donations are personal gifts to support medical treatment"

### Fraud Prevention & Limits
- **Rate limiting**: 5 donations per minute per IP
- **No maximum limit**: Prioritize zero friction
- **Large donations**: Email alert for $500+ (no manual review)
- **Anonymous**: Fully supported, email optional

## Admin Panel Features

### Core Requirements
1. **Transaction Monitoring**: List all donations with filters
2. **Update Posting**: Bilingual rich text editor for family updates
3. **Data Export**: CSV download for accounting purposes
4. **Email Alerts**: Daily summary + high-value notifications ($500+)
5. **Analytics Dashboard**: Basic visitor and conversion metrics

### Admin Interface (`/admin` route, password protected)
```typescript
interface UpdatePost {
  title: { pt: string; en: string }
  content: { pt: string; en: string } // Markdown supported
  media?: File[] // Images/videos
  author: 'Family' | 'Medical Team' | 'José'
  isPinned?: boolean // Stick important updates
}
```

### Update System
- **Posting**: Family members via admin panel (weekly minimum)
- **Languages**: Both PT and EN required for each post
- **Media**: Support for photos (storage: Cloudinary or Supabase TBD)
- **Approval**: Single family member can post (no review required)
- **No goal cap**: Continue accepting donations while expenses ongoing
- **Donor messages**: Optional, donor chooses public/private

## Critical Implementation Details

### Internationalization Strategy
```typescript
// Auto-detect but allow override
const detectLocale = (req: Request): 'pt' | 'en' => {
  const country = req.geo?.country
  const browserLang = req.headers['accept-language']
  
  if (country === 'BR' || country === 'PT') return 'pt'
  if (browserLang?.startsWith('pt')) return 'pt'
  return 'en'
}
```

### Conversion Optimization
- **Preset amounts** based on currency (e.g., $50/$100/$250 vs R$100/R$250/R$500)
- **Social proof**: "João from São Paulo just donated R$100"
- **Urgency without manipulation**: "Day X of treatment journey"
- **Progress thermometer**: Visual goal tracking
- **One-click repeat**: Save payment method for returning donors

## UX Philosophy (Detailed in UX_STRATEGY.md)

### Emotional Journey Mapping
1. **Arrival**: Immediate understanding of urgency + hope
2. **Connection**: Personal story that resonates
3. **Trust Building**: Credentials, transparency, social proof
4. **Decision**: Clear value proposition
5. **Action**: Frictionless donation
6. **Confirmation**: Gratitude + impact visualization

### Mobile-First Principles
- Thumb-friendly CTAs
- Sticky donation button
- Collapsible story sections
- Native payment sheets (Apple/Google Pay)
- Optimized images with lazy loading

## Content Architecture

### Narrative Arc
```
1. HOOK (3 seconds to capture)
   "After 50 years healing others, Dr. José needs us"

2. CONTEXT (Build empathy)
   - The sudden stroke
   - 74 years of service
   - Father of 5, grandfather
   - Trained in Germany & USA, served Brazil

3. URGENCY (Why now)
   - Critical treatment window
   - Specific therapies needed
   - Family doing everything possible

4. TRANSPARENCY (Build trust)
   - Exact fund allocation
   - Regular updates promised
   - Family introduction

5. CALL TO ACTION (Clear path)
   - Multiple giving options
   - Every amount helps
   - Share if can't donate
```

### Microcopy Excellence
- Button: "Contribute Now" not "Donate" (more active)
- Progress: "$X raised by Y people" (social proof)
- Thank you: "You're now part of José's recovery journey"
- Share: "Help spread José's story" (action-oriented)

## Technical Specifications

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90
- Core Web Vitals: All green

### Security Implementation
```typescript
// Rate limiting with Upstash
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 donations per minute per IP
  analytics: true,
})

// Donation validation
const DonationSchema = z.object({
  amount: z.number().min(1).max(10000),
  currency: z.enum(['USD', 'BRL', 'EUR']),
  payment_method: z.string(),
  email: z.string().email().optional(),
  name: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
})
```

### Analytics Events
- `page_view` with locale, referrer
- `donation_started` with amount, currency
- `donation_completed` with method, amount
- `donation_failed` with error type
- `share_clicked` with platform
- `update_read` with post_id

## State Management

### Global State (Zustand)
```typescript
interface DonationStore {
  totalRaised: number
  donorCount: number
  recentDonations: Donation[]
  selectedAmount: number
  selectedCurrency: Currency
  paymentMethod: PaymentMethod
  locale: 'pt' | 'en'
}
```

### Real-time Updates (Supabase Realtime)
- Subscribe to donation inserts
- Broadcast new total to all clients
- Show toast notification for new donations
- Update progress bar smoothly

## API Design

### Public Endpoints
```typescript
GET /api/stats
  → { totalRaised, donorCount, goalAmount, recentDonations }

POST /api/donate
  → Initiate payment flow

GET /api/updates?limit=5
  → Recent updates with pagination

POST /api/subscribe
  → Email list for updates
```

### Admin Endpoints (JWT protected)
```typescript
POST /api/admin/updates
  → Create new update post

GET /api/admin/analytics
  → Detailed donation analytics

POST /api/admin/export
  → Export donor data for tax purposes
```

## Critical Implementation Blockers

### Must Resolve Before Development
1. **Account Holder**: Specific person (not "or other family member")
2. **PIX Key Type**: CPF, Phone, or Email for Mercado Pago
3. **Wise Account**: Confirm can be opened in account holder's name

### Currency Display Consistency
```typescript
// Show conversion throughout journey
interface CurrencyDisplay {
  primary: string    // "R$ 100"
  secondary: string  // "≈ $20 USD"
  rate: number      // Current exchange rate
}
```

## Error Handling & Edge Cases

### Payment Failures
```typescript
const handlePaymentError = (error: PaymentError) => {
  // User-friendly messages by error type
  const messages = {
    card_declined: t('payment.card_declined'),
    insufficient_funds: t('payment.insufficient_funds'),
    network_error: t('payment.try_again'),
  }
  
  // Log to Sentry for monitoring
  captureException(error, { 
    tags: { type: 'payment_failure' },
    extra: { method: paymentMethod }
  })
  
  // Show retry with different method
  showErrorWithRetry(messages[error.type])
}
```

### Resilience Patterns
- Optimistic UI updates with rollback
- Offline detection with queue for donations
- Automatic currency detection with manual override
- Graceful degradation if JS disabled (basic form)

## Deployment Strategy

### Environment Setup
1. `main` branch → Production (helpjosegomes.com)
2. `staging` branch → Preview deployments
3. Feature branches → Automatic previews

### Pre-launch Checklist
- [ ] All payment methods tested with real cards
- [ ] Load testing (expect viral social media moments)
- [ ] SEO meta tags and Open Graph images
- [ ] Analytics and conversion tracking verified
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Content reviewed by native speakers
- [ ] Legal disclaimer reviewed
- [ ] Backup payment instructions ready
- [ ] Admin interface secured and tested
- [ ] Email notifications working

---

*This architecture prioritizes conversion, trust, and global accessibility while maintaining simplicity for rapid deployment.*