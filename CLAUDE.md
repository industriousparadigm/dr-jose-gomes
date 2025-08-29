# Claude AI Development Context

## Project: Save Dr. José Gomes - Medical Crowdfunding Platform

### Mission
Building a crowdfunding platform for Dr. José Gomes de Oliveira's stroke recovery treatment. Target: $25,000 USD. Platform must evoke emotion, build trust, and minimize payment friction.

### Current Status
- **Phase**: MVP Development
- **Approach**: Soft launch with family/friends testing
- **Timeline**: Core features in ~1 week

### Key Technical Decisions
- **Framework**: Next.js 15 with TypeScript
- **Database**: Neon Postgres (connection in .env.local)
- **Hosting**: Vercel (project: dr-jose-gomes)
- **Repository**: github.com/industriousparadigm/dr-jose-gomes
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod

### MVP Features (Must Have)
1. Dual language (PT/EN) with auto-detection
2. Multiple payment methods: Stripe, PayPal, PIX, MB Way
3. Admin panel for transactions and updates
4. Anonymous donations allowed
5. Progress counter
6. Mobile-first design
7. Basic privacy compliance

### Development Principles
1. **TDD Approach**: Write tests first, then implement
2. **Security First**: All secrets in .env.local (gitignored)
3. **Commit Often**: Test and commit when features work
4. **Three-Layer Persistence**: Never lose a donation
5. **Zero Friction**: Minimize fields, allow anonymous

### Payment Integration Status
- **Stripe**: Test mode initially (sandbox)
- **PayPal**: Sandbox for development
- **PIX**: Display only initially (Mercado Pago later)
- **MB Way**: Display only initially

### Testing Commands
```bash
npm run dev      # Development server
npm run test     # Run tests
npm run build    # Production build
npm run lint     # Lint code
npm run type-check # TypeScript check
```

### Git Workflow
```bash
# Feature development
git add .
git commit -m "feat: description"
git push origin main

# After testing
git commit -m "test: verify feature works"
```

### Environment Variables (.env.local)
```env
# Database (Neon Postgres) - Already configured
DATABASE_URL=...

# Payment Processors (Sandbox/Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

PAYPAL_CLIENT_ID=sb-...
PAYPAL_SECRET=...

# Admin
ADMIN_PASSWORD=... # For /admin access

# Public Config
NEXT_PUBLIC_GOAL_AMOUNT=25000
NEXT_PUBLIC_SITE_URL=https://dr-jose-gomes.vercel.app
```

### Critical Blockers (Need User Input)
1. Account holder name (Alexandra or specific person)
2. PIX key type (CPF/Phone/Email)
3. Wise account confirmation

### Directory Structure
```
/app
  /[locale]
    /page.tsx         # Main landing
    /admin           # Admin panel
    /api            # API routes
/components
  /donation       # Donation flow
  /ui            # Shared UI
/lib
  /db            # Database queries
  /i18n          # Translations
  /payments      # Payment processors
/public
  /images        # Photos of Dr. José
```

### Testing Approach
1. Unit tests for utilities
2. Integration tests for API routes
3. E2E tests for donation flow
4. Manual testing with family (5-10 testers)

### Security Checklist
- [ ] All secrets in .env.local
- [ ] .env.local in .gitignore
- [ ] Rate limiting on donations
- [ ] Input sanitization
- [ ] HTTPS only on Vercel
- [ ] SQL injection prevention
- [ ] XSS protection

### Performance Targets
- Lighthouse score: >90
- First paint: <1.5s
- Time to interactive: <3s
- Mobile-first optimization

### Next Steps Priority
1. Initialize Next.js project
2. Set up database schema
3. Create landing page
4. Add donation form
5. Implement payment UI
6. Build admin panel
7. Add internationalization
8. Test with sandbox payments
9. Soft launch to family

---

*Remember: This is for a real medical emergency. Every line of code matters. Test thoroughly, commit often, prioritize reliability.*