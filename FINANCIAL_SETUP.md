# Financial Infrastructure Setup Guide

## Quick Answer: What You Actually Need

### The Pragmatic Approach (Recommended)
**Use personal accounts + payment processors.** Medical crowdfunding for family members is typically treated as personal gifts, not charitable donations. This is how SaveWalterWhite.com worked - personal GoFundMe managed by Walter Jr.

### Minimum Viable Setup (Can launch in 2-3 days)
1. **Wise Business Account** (best for multi-currency)
2. **Stripe Account** (handles cards globally)
3. **Crypto Wallet** (for BTC/Lightning)
4. **PayPal Business** (backup option)

---

## Bank Account Strategy

### Option 1: Wise (Formerly TransferWise) ✅ RECOMMENDED
**Why Wise is perfect for this:**
- Get local bank details in USD, EUR, GBP, BRL
- One account, multiple currencies
- Transparent fees (~0.5% conversion)
- Easy API integration for automation
- Setup takes 2-3 business days

**What you need to open:**
1. Passport/ID
2. Proof of address
3. Simple KYC verification
4. ~$50 deposit to activate

**Account details you'll get:**
```
USD: Routing + Account number (US donors)
EUR: IBAN (European donors)
BRL: Local account details (Brazilian donors)
GBP: Sort code + Account number (UK donors)
```

### Option 2: Revolut Business
**Pros:**
- Similar to Wise but with physical cards
- Good mobile app
- Instant account opening

**Cons:**
- Higher fees for large volumes
- Less transparent pricing
- Some countries have withdrawal limits

### Option 3: Traditional Bank (Santander/BBVA)
**Only if you need:**
- Physical branch support
- Corporate account features
- Local credibility

**Downsides:**
- 2-4 weeks to open
- High international fees
- Complex for multi-currency

### Option 4: Mercury (US-focused)
**If primarily US donations:**
- US bank account without US presence
- Great for Stripe integration
- Professional dashboard

---

## Payment Processor Setup

### Stripe (Priority 1)
**Account Type:** Standard account (not Express/Custom)

**Registration needs:**
1. Business type: **Individual/Sole Proprietor**
2. Business category: **Fundraising/Crowdfunding**
3. Website URL: helpjosegomes.vercel.app
4. Bank account: Your Wise USD details
5. Tax ID: Your personal tax number

**Supported payment methods:**
- All major cards (Visa, MC, Amex)
- Apple Pay / Google Pay
- SEPA Direct Debit (Europe)
- Local payment methods (Boleto, OXXO, etc.)

**Fees:** 2.9% + $0.30 per transaction

### PayPal Business (Priority 2)
**Why you need it:**
- 30% of online donors prefer PayPal
- Instant payouts
- Venmo integration (US)

**Setup:**
1. Business account (using your name + "Medical Fund")
2. Link to Wise account
3. Enable donation buttons
4. Set up IPN for webhook notifications

**Fees:** 2.89% + $0.49 per transaction

### Country-Specific Processors

#### Brazil - Mercado Pago
**For PIX integration:**
1. Create Mercado Pago account
2. Get API credentials
3. Link Brazilian bank account (or use Wise BRL)
4. PIX key = CPF or phone number

**Zero fees for PIX!** This is huge for Brazilian donors.

#### Portugal - Easypay or SIBS
**For MB Way:**
1. Easypay is easier for foreigners
2. Need EU bank account (Wise EUR works)
3. 0.7% + €0.15 per transaction

#### Germany - Mollie
**Alternative to Stripe for SEPA:**
- Better for recurring donations
- Lower fees for European cards

---

## Cryptocurrency Setup

### Bitcoin (BTC)
**Wallet Options:**

**Option 1: Exodus (Beginner-friendly)**
- Desktop + mobile apps
- Built-in exchange
- Recovery phrase backup

**Option 2: Electrum (More control)**
- Generate multiple addresses
- Better privacy
- Hardware wallet support

**Generate addresses for:**
```env
BTC_ADDRESS=bc1q... (Native SegWit for lower fees)
BTC_LEGACY_ADDRESS=1A1zP... (For older wallets)
```

### Lightning Network
**Strike App (Easiest)**
1. Download Strike app
2. Create Lightning invoice
3. Can auto-convert to USD

**Alternative: Phoenix Wallet**
- Non-custodial
- Good for larger amounts

### Stablecoins (USDT/USDC)
**MetaMask Wallet:**
```env
USDT_ERC20_ADDRESS=0x... (Ethereum)
USDT_TRC20_ADDRESS=T... (Tron - lower fees)
USDC_ADDRESS=0x... (Same as ERC20)
```

**Important:** Use separate addresses for tracking!

---

## Legal Structure Options

### Option A: Personal Fundraising (Recommended)
**How it works:**
- Run through your personal accounts
- Donations are "gifts" not tax-deductible donations
- Simple, fast, legal

**Tax implications:**
- **US:** Gifts under $18,000 per donor are tax-free
- **Brazil:** May need to declare on annual tax return
- **EU:** Generally tax-free under gift limits

**Disclaimer needed on site:**
```
"Donations are personal gifts to support José's medical treatment 
and are not tax-deductible charitable contributions."
```

### Option B: Fiscal Sponsorship
**Partner with existing 501(c)(3):**
- GoFundMe Charity
- GiveWell
- Local hospital foundation

**Pros:**
- Tax-deductible for US donors
- More trust

**Cons:**
- 5-8% platform fees
- Less control
- Slower disbursements

### Option C: Create Formal Entity
**Only if raising >$100k:**
- Form LLC or nonprofit
- Complex, expensive ($2-5k)
- Takes 4-6 weeks

---

## Real-World Reference: SaveWalterWhite.com

**What they did:**
1. Personal GoFundMe by Walter Jr.
2. Linked to personal checking account
3. No formal entity
4. Simple disclaimer about gifts
5. Raised $177,716

**Key lessons:**
- Personal story > legal structure
- Speed matters in medical cases
- Transparency builds trust
- Keep it simple

---

## Step-by-Step Launch Checklist

### Setup Phase (While Accounts Being Created)

#### Day 1-2: Accounts
- [ ] Open Wise account
- [ ] Verify identity
- [ ] Activate USD, EUR, BRL receiving
- [ ] Note account details for .env

#### Day 3-4: Payment Processors
- [ ] Create Stripe account
- [ ] Complete Stripe verification
- [ ] Set up PayPal Business
- [ ] Configure Mercado Pago (for PIX)

#### Day 5: Crypto
- [ ] Download Exodus/Electrum
- [ ] Generate BTC address
- [ ] Set up Lightning (Strike app)
- [ ] Create MetaMask for USDT
- [ ] Save all addresses securely

#### Day 6-7: Integration
- [ ] Add all keys to .env
- [ ] Test payment flows
- [ ] Set up webhook endpoints
- [ ] Configure email notifications

### Launch Day
- [ ] Verify all payment methods work
- [ ] Test with small real transaction
- [ ] Enable production mode
- [ ] Monitor first donations closely

---

## Specific Credentials Needed for .env

```env
# Wise (after account creation)
WISE_ACCOUNT_ID=
WISE_API_TOKEN=

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_WEBHOOK_ID=

# Mercado Pago (Brazil)
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Bank Details (from Wise)
BANK_USD_ROUTING=
BANK_USD_ACCOUNT=
BANK_EUR_IBAN=
BANK_BRL_ACCOUNT=

# Crypto (generate yourself)
BTC_ADDRESS=
BTC_LIGHTNING_INVOICE=
ETH_ADDRESS=
USDT_TRC20_ADDRESS=

# For display on site
PIX_KEY= (CPF or phone)
ZELLE_EMAIL=
```

---

## Compliance & Best Practices

### Required Disclaimers
```markdown
1. "Donations are personal gifts, not tax-deductible"
2. "Funds will be used for medical treatment and related expenses"
3. "Updates will be provided regularly on fund usage"
```

### Record Keeping
**Track everything:**
- Donor information (name, email, amount)
- Date and payment method
- Fund disbursements
- Medical receipts (keep private)

**Use spreadsheet or Airtable:**
```
Date | Donor | Amount | Currency | Method | Notes
```

### Withdrawal Strategy
1. **Don't withdraw daily** (looks suspicious)
2. **Weekly batches** are ideal
3. **Keep some buffer** in processor accounts
4. **Document large withdrawals** with purpose

### Trust Builders
- Link to Dr. José's medical license
- Show family member as fund manager
- Regular photo/video updates
- Clear breakdown of expenses

---

## Platform-Specific Tips

### If Using GoFundMe Instead
**Pros:**
- Trusted brand
- Built-in social features
- No technical setup

**Cons:**
- 2.9% + $0.30 per donation
- Platform fee abolished but tips expected
- Less control over design
- Can't do PIX/MB Way

### If Using Donorbox
**Good middle ground:**
- Handles compliance
- Multi-currency support
- Recurring donations
- 1.5% platform fee

---

## Emergency Backup Plan

**If payment processors fail:**

### Manual Instructions Page
```markdown
## Other Ways to Help

### Brazil
PIX: [CPF/Phone]
Banco do Brasil: Ag XXXX, Conta XXXXX

### USA  
Zelle: email@example.com
Venmo: @username

### Europe
IBAN: XXXXXXXXXXXX
SWIFT: XXXXXXXXX

### Crypto
BTC: bc1q...
Lightning: invoice...
```

---

## Red Flags to Avoid

1. **Don't use business terms** like "invest" or "returns"
2. **Don't promise** specific medical outcomes
3. **Don't hide** who manages the funds
4. **Don't mix** personal and donation funds
5. **Don't ignore** tax obligations in recipient country

---

## Questions You'll Get from Payment Providers

**Stripe:** "What's your business model?"
> "Personal medical crowdfunding for family member"

**Bank:** "Expected monthly volume?"
> "$25,000 one-time campaign over 2-3 months"

**PayPal:** "Are you a registered charity?"
> "No, personal fundraising campaign"

---

## Next Actions for You

1. **Today:** Open Wise account (takes 2-3 days to verify)
2. **Tomorrow:** Apply for Stripe account
3. **Day 3:** Set up crypto wallets
4. **Day 4:** Create PayPal Business
5. **Day 5:** Test everything with $1 transactions

Once you have account details, update the .env file and we're ready to launch.

---

*Remember: Speed matters in medical fundraising. Don't let perfect be the enemy of good. Launch with Stripe + PayPal + Crypto, add local payment methods as you go.*