# Development Strategy & Testing Architecture

## Executive Summary
Comprehensive development and testing strategy for Dr. José Gomes medical crowdfunding platform. Implements TDD methodology, three-layer transaction persistence, and thorough payment testing across Stripe, PayPal, PIX, and MB Way. Soft launch with family/friends before public release.

## Core Development Philosophy

### Test-Driven Development (TDD) Approach
Every feature follows this cycle:
1. **RED**: Write failing test that defines desired behavior
2. **GREEN**: Write minimal code to pass the test
3. **REFACTOR**: Improve code while keeping tests green
4. **VERIFY**: Manual testing in browser + automated E2E

### Why TDD for This Project
- **High stakes**: Real money, real medical need
- **No room for errors**: Lost donations = lost treatment funds
- **Trust critical**: Any bug damages credibility
- **Audit trail**: Tests document expected behavior

## Transaction Logging Architecture

### Three-Layer Persistence Strategy

```typescript
// Layer 1: Database (Primary)
interface DonationRecord {
  id: string                    // UUID v4
  amount: Decimal               // Precise decimal type
  currency: Currency
  payment_method: PaymentMethod
  processor_id: string          // Stripe/PayPal transaction ID
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  donor_email?: string
  donor_name?: string
  ip_address: string            // For geographic analytics
  user_agent: string            // Device tracking
  created_at: timestamp
  updated_at: timestamp
  metadata: {
    processor_response: json    // Full API response
    webhook_events: json[]      // All webhooks received
    idempotency_key: string     // Prevent duplicates
  }
}

// Layer 2: Append-Only Audit Log
interface AuditLog {
  event_id: string
  event_type: 'donation_initiated' | 'payment_captured' | 'webhook_received'
  timestamp: timestamp
  data: json
  hash: string                  // SHA-256 of previous entry + data
}

// Layer 3: External Backup (Daily)
// Supabase → CSV export → Google Sheets/S3
```

### Implementation: Never Lose a Transaction

```typescript
// services/transaction-logger.ts
class TransactionLogger {
  async logDonation(data: DonationData): Promise<void> {
    // 1. Write to database with transaction
    const dbWrite = await db.transaction(async (tx) => {
      const donation = await tx.donations.create(data)
      await tx.audit_logs.create({
        event_type: 'donation_initiated',
        data: donation,
        hash: this.computeHash(donation)
      })
      return donation
    })

    // 2. Backup to Redis with TTL (redundancy)
    await redis.setex(
      `donation:${dbWrite.id}`,
      86400 * 7, // 7 days
      JSON.stringify(dbWrite)
    )

    // 3. Send to analytics (async, non-blocking)
    analytics.track('Donation Created', dbWrite)

    // 4. If critical amount, email notification
    if (data.amount > 500) {
      await sendEmail('critical-donation', dbWrite)
    }
  }

  async reconcile(): Promise<void> {
    // Daily job to verify consistency
    const stripeTransactions = await stripe.charges.list()
    const dbTransactions = await db.donations.findAll()
    
    const missing = stripeTransactions.filter(
      st => !dbTransactions.find(dt => dt.processor_id === st.id)
    )
    
    if (missing.length > 0) {
      await this.recoverMissingTransactions(missing)
      await notifyAdmin('Missing transactions recovered', missing)
    }
  }
}
```

### Bitcoin/Crypto Considerations

```typescript
// For MVP: Display addresses only, manual reconciliation
// Post-MVP: Implement webhook listeners

interface CryptoStrategy {
  mvp: {
    display: 'static_addresses',
    verification: 'manual_check',
    tools: ['blockchain_explorer', 'email_notification']
  },
  enhanced: {
    service: 'BTCPay Server' | 'Coinbase Commerce',
    features: ['auto_conversion', 'webhooks', 'invoicing']
  }
}

// MVP Approach (Recommended)
const CryptoMVP = {
  // Just display addresses
  showAddresses: () => ({
    btc: process.env.BTC_ADDRESS,
    lightning: process.env.LIGHTNING_INVOICE,
  }),
  
  // Manual verification via admin panel
  adminVerification: async () => {
    // Check blockchain explorers
    // Match amounts to expected donations
    // Manually mark as received
  }
}
```

## Testing Strategy

### Payment Testing Without Real Money

#### 1. Stripe Test Mode
```typescript
// .env.test
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

// Test card numbers
const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  insufficient: '4000 0000 0000 9995',
  threeDSecure: '4000 0025 0000 3155',
}

// test/payments/stripe.test.ts
describe('Stripe Payment Flow', () => {
  it('should complete successful payment', async () => {
    const result = await processPayment({
      amount: 50,
      currency: 'USD',
      card: TEST_CARDS.success,
    })
    
    expect(result.status).toBe('succeeded')
    expect(result.amount).toBe(5000) // Cents
    
    // Verify database record
    const donation = await db.donations.findByProcessorId(result.id)
    expect(donation).toBeDefined()
    expect(donation.status).toBe('completed')
  })
  
  it('should handle declined card gracefully', async () => {
    const result = await processPayment({
      amount: 50,
      card: TEST_CARDS.decline,
    })
    
    expect(result.status).toBe('failed')
    expect(result.error.code).toBe('card_declined')
    
    // Verify audit log
    const log = await db.audit_logs.findLatest()
    expect(log.event_type).toBe('payment_failed')
  })
})
```

#### 2. PayPal Sandbox
```typescript
// .env.test
PAYPAL_CLIENT_ID=sb-...
PAYPAL_SECRET=...
PAYPAL_MODE=sandbox

// Sandbox test accounts
const PAYPAL_TEST = {
  buyer: 'buyer@test.com',
  password: 'test123',
}
```

#### 3. Mock Payment Gateway for E2E
```typescript
// test/mocks/payment-gateway.ts
class MockPaymentGateway {
  private scenarios = new Map<string, PaymentResult>()
  
  setupScenario(email: string, result: PaymentResult) {
    this.scenarios.set(email, result)
  }
  
  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Return predetermined result based on email
    const scenario = this.scenarios.get(data.email)
    if (scenario) return scenario
    
    // Default success
    return {
      success: true,
      transactionId: `mock_${Date.now()}`,
      amount: data.amount,
    }
  }
}

// In E2E tests
test('complete donation flow', async ({ page }) => {
  // Setup mock scenario
  await mockGateway.setupScenario('test@example.com', {
    success: true,
    transactionId: 'test_123'
  })
  
  await page.goto('/');
  await page.click('[data-testid="donate-button"]');
  await page.fill('[name="amount"]', '100');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.donation-amount')).toContainText('$100');
})
```

## Development Workflow

### Feature Implementation Process

```bash
# 1. Create feature branch
git checkout -b feature/payment-integration

# 2. Write test first
npm run test:watch -- payment.test.ts

# 3. See it fail (RED)
# ✗ Payment should process successfully

# 4. Implement feature (GREEN)
# ✓ Payment should process successfully

# 5. Run full test suite
npm run test

# 6. Run E2E tests
npm run test:e2e

# 7. Manual testing checklist
# □ Test on mobile (iPhone/Android)
# □ Test slow connection (throttle to 3G)
# □ Test different currencies
# □ Test error scenarios
# □ Test accessibility (screen reader)

# 8. Deploy to preview
git push origin feature/payment-integration
# Vercel creates preview deployment

# 9. Test with real test payments
# Use Stripe test mode on preview URL

# 10. Get approval and merge
```

### Test File Structure

```
tests/
├── unit/
│   ├── components/
│   │   ├── DonationForm.test.tsx
│   │   ├── ProgressBar.test.tsx
│   │   └── UpdatePost.test.tsx
│   ├── services/
│   │   ├── payment-processor.test.ts
│   │   ├── transaction-logger.test.ts
│   │   └── email-service.test.ts
│   └── utils/
│       ├── currency.test.ts
│       └── validation.test.ts
├── integration/
│   ├── api/
│   │   ├── donate.test.ts
│   │   ├── stats.test.ts
│   │   └── webhooks.test.ts
│   └── database/
│       └── transactions.test.ts
├── e2e/
│   ├── donation-flow.spec.ts
│   ├── multi-language.spec.ts
│   └── mobile-experience.spec.ts
└── fixtures/
    ├── donations.json
    └── test-users.json
```

## Test-Driven Development Examples

### Example 1: Donation Form Validation

```typescript
// Step 1: Write the test (RED)
// tests/unit/components/DonationForm.test.tsx

describe('DonationForm', () => {
  it('should validate minimum donation amount', () => {
    render(<DonationForm />)
    
    const amountInput = screen.getByLabelText('Amount')
    const submitButton = screen.getByText('Donate')
    
    // Try to donate $0
    fireEvent.change(amountInput, { target: { value: '0' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Minimum donation is $1')).toBeInTheDocument()
    expect(mockProcessPayment).not.toHaveBeenCalled()
  })
  
  it('should show amount in local currency', () => {
    render(<DonationForm userCountry="BR" />)
    
    const preset = screen.getByText('R$ 50')
    fireEvent.click(preset)
    
    expect(screen.getByLabelText('Amount').value).toBe('50')
    expect(screen.getByText('≈ $10 USD')).toBeInTheDocument()
  })
})

// Step 2: Implement (GREEN)
// components/DonationForm.tsx

export function DonationForm({ userCountry }: Props) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (Number(amount) < 1) {
      setError('Minimum donation is $1')
      return
    }
    
    processPayment({ amount })
  }
  
  // ... rest of implementation
}

// Step 3: Refactor
// Extract validation, add currency conversion, improve UX
```

### Example 2: Transaction Persistence

```typescript
// Step 1: Test (RED)
// tests/integration/api/donate.test.ts

describe('POST /api/donate', () => {
  it('should persist donation even if webhook fails', async () => {
    // Arrange
    const donationData = {
      amount: 100,
      currency: 'USD',
      email: 'test@example.com'
    }
    
    // Mock Stripe success but webhook failure
    mockStripe.charges.create.mockResolvedValue({
      id: 'ch_test123',
      status: 'succeeded'
    })
    mockWebhook.send.mockRejectedValue(new Error('Webhook failed'))
    
    // Act
    const response = await request(app)
      .post('/api/donate')
      .send(donationData)
    
    // Assert
    expect(response.status).toBe(200)
    
    // Check database
    const donation = await db.donations.findOne({
      where: { processor_id: 'ch_test123' }
    })
    expect(donation).toBeDefined()
    expect(donation.status).toBe('completed')
    
    // Check audit log
    const logs = await db.audit_logs.findAll({
      where: { event_type: 'webhook_failed' }
    })
    expect(logs).toHaveLength(1)
  })
})

// Step 2: Implement (GREEN)
// pages/api/donate.ts

export default async function handler(req, res) {
  try {
    // Process payment
    const charge = await stripe.charges.create({
      amount: req.body.amount * 100,
      currency: req.body.currency,
      source: req.body.token,
    })
    
    // Persist immediately (don't wait for webhook)
    const donation = await db.donations.create({
      amount: req.body.amount,
      currency: req.body.currency,
      processor_id: charge.id,
      status: 'completed',
      email: req.body.email,
    })
    
    // Try webhook (non-blocking)
    sendWebhook(donation).catch(error => {
      db.audit_logs.create({
        event_type: 'webhook_failed',
        data: { error: error.message, donation_id: donation.id }
      })
    })
    
    res.json({ success: true, donation_id: donation.id })
  } catch (error) {
    // Log error but don't expose details
    logger.error('Donation failed', error)
    res.status(500).json({ error: 'Payment processing failed' })
  }
}
```

## Continuous Verification Strategy

### Automated Checks (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
      
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

### Manual Verification Checklist

```markdown
## Pre-Deployment Checklist

### Payment Flow Testing
- [ ] Stripe payment succeeds (test card: 4242...)
- [ ] PayPal payment succeeds (sandbox account)
- [ ] Declined card shows error message
- [ ] Network timeout handled gracefully
- [ ] Duplicate payment prevented (idempotency)

### Multi-Currency Testing
- [ ] USD donation works
- [ ] BRL donation with PIX instructions
- [ ] EUR donation with SEPA
- [ ] Currency conversion displayed correctly

### Mobile Testing
- [ ] iPhone Safari payment flow
- [ ] Android Chrome payment flow
- [ ] Apple Pay works (if available)
- [ ] Google Pay works (if available)

### Data Persistence
- [ ] Donation saved to database
- [ ] Audit log entry created
- [ ] Email confirmation sent
- [ ] Stats updated in real-time

### Error Scenarios
- [ ] Server error returns graceful message
- [ ] Payment timeout handled
- [ ] Invalid data rejected with clear error
- [ ] Rate limiting works

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces donations
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
```

## Development Environment Setup

### Local Development Stack

```bash
# Docker Compose for services
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: donations_dev
      POSTGRES_PASSWORD: localdev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
```

### Environment Configuration

```bash
# .env.local (Development)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:localdev@localhost:5432/donations_dev
REDIS_URL=redis://localhost:6379

# Payment Processors (Test Mode)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=sb-...
PAYPAL_SECRET=...

# Email (Local)
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=test@helpjosegomes.local

# Feature Flags
ENABLE_CRYPTO=false
ENABLE_PIX=false
ENABLE_MBWAY=false
```

## Monitoring & Observability

### MVP Monitoring (Vercel Analytics + Custom)
- **Vercel Analytics**: Basic visitor tracking (sufficient for MVP)
- **Custom Alerts**: Daily summary email of donations
- **High-value Alert**: Email for donations >$500
- **Public Progress Bar**: Live donation counter on homepage

### What to Monitor

```typescript
// services/monitoring.ts
class DonationMonitor {
  // Real-time metrics
  metrics = {
    totalRaised: new Gauge('donations_total_amount'),
    donationCount: new Counter('donations_count'),
    averageAmount: new Histogram('donation_amount'),
    conversionRate: new Gauge('conversion_rate'),
    paymentErrors: new Counter('payment_errors'),
  }
  
  // Alert thresholds
  alerts = {
    highValueDonation: (amount: number) => amount > 1000,
    failureRate: (rate: number) => rate > 0.05, // 5%
    lowConversion: (rate: number) => rate < 0.01, // 1%
  }
  
  // Health checks
  healthChecks = {
    database: async () => {
      const result = await db.raw('SELECT 1')
      return result.rows.length === 1
    },
    stripe: async () => {
      const balance = await stripe.balance.retrieve()
      return balance !== null
    },
    redis: async () => {
      const pong = await redis.ping()
      return pong === 'PONG'
    }
  }
}
```

### Logging Standards

```typescript
// Every log must include
interface LogContext {
  timestamp: ISO8601
  level: 'debug' | 'info' | 'warn' | 'error'
  service: string
  traceId: string  // For request tracing
  userId?: string
  donationId?: string
  error?: ErrorDetails
}

// Example usage
logger.info('Donation processed', {
  service: 'payment-processor',
  traceId: req.headers['x-trace-id'],
  donationId: donation.id,
  amount: donation.amount,
  currency: donation.currency,
  processingTime: Date.now() - startTime,
})
```

## Security Testing

### Security Test Suite

```typescript
// tests/security/payment-security.test.ts

describe('Payment Security', () => {
  it('should prevent SQL injection in donation amount', async () => {
    const maliciousAmount = "100; DROP TABLE donations;"
    
    const response = await request(app)
      .post('/api/donate')
      .send({ amount: maliciousAmount })
    
    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid amount')
    
    // Verify table still exists
    const tables = await db.raw(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'donations'
    `)
    expect(tables.rows).toHaveLength(1)
  })
  
  it('should rate limit donation attempts', async () => {
    const requests = Array(10).fill(null).map(() => 
      request(app).post('/api/donate').send({ amount: 10 })
    )
    
    const responses = await Promise.all(requests)
    const rateLimited = responses.filter(r => r.status === 429)
    
    expect(rateLimited.length).toBeGreaterThan(0)
  })
  
  it('should sanitize user input in messages', async () => {
    const xssPayload = '<script>alert("XSS")</script>'
    
    const response = await request(app)
      .post('/api/donate')
      .send({ 
        amount: 50,
        message: xssPayload 
      })
    
    const donation = await db.donations.findOne({ 
      where: { id: response.body.donation_id }
    })
    
    expect(donation.message).not.toContain('<script>')
    expect(donation.message).toContain('&lt;script&gt;')
  })
})
```

## Performance Testing

### Load Testing Script

```javascript
// tests/load/donation-load.js (k6 script)

import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
}

export default function () {
  // Simulate donation flow
  const payload = JSON.stringify({
    amount: Math.floor(Math.random() * 100) + 10,
    currency: 'USD',
    email: `test${Date.now()}@example.com`,
  })
  
  const response = http.post('https://preview.helpjosegomes.vercel.app/api/donate', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'donation processed': (r) => JSON.parse(r.body).success === true,
    'response time OK': (r) => r.timings.duration < 500,
  })
  
  sleep(1)
}
```

## Rollback Strategy

### If Something Goes Wrong

```typescript
// Quick rollback process
interface RollbackPlan {
  detection: {
    monitors: ['Sentry', 'Vercel Analytics', 'Stripe Dashboard'],
    alerts: ['High error rate', 'Payment failures', 'Site down'],
  },
  
  immediate: {
    1: 'Revert to previous deployment in Vercel',
    2: 'Verify payments still working',
    3: 'Check no data loss',
  },
  
  recovery: {
    1: 'Identify root cause from logs',
    2: 'Fix issue in hotfix branch',
    3: 'Test thoroughly',
    4: 'Deploy fix',
    5: 'Monitor closely for 24h',
  },
  
  communication: {
    internal: 'Slack notification to team',
    external: 'Status page update if > 5 min downtime',
  }
}
```

---

*This development strategy ensures we build with confidence, test thoroughly, and never lose a donation. Every line of code is verified, every payment is logged, and every edge case is handled.*