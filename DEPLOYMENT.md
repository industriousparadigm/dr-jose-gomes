# Deployment Guide - Dr. José Gomes Fund

This guide covers deploying the crowdfunding platform to production.

## 📋 Pre-Deployment Checklist

### Required Services
- [ ] Vercel account (or other hosting)
- [ ] PostgreSQL database (Vercel Postgres recommended)
- [ ] Stripe account
- [ ] Resend account for emails
- [ ] Google Analytics account
- [ ] Domain name

### Environment Variables
All required environment variables must be set before deployment:

```env
# Database (Vercel Postgres)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Stripe (Required)
STRIPE_SECRET_KEY=sk_live_...  # Use live key for production
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (Resend)
RESEND_API_KEY=re_...

# Authentication
SESSION_SECRET=  # Generate 32+ character random string
ADMIN_USERNAME=  # Change from default
ADMIN_PASSWORD_HASH=  # Generate with bcrypt

# Analytics (Optional but recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_GA_CONVERSION_ID=AW-...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GOAL_AMOUNT=25000
```

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Node.js Version: 18.x or higher

### Step 3: Configure Environment Variables
1. In Vercel dashboard, go to Settings → Environment Variables
2. Add all variables from `.env.local`
3. Ensure production values are used (live Stripe keys, etc.)

### Step 4: Set Up Database
1. Go to Vercel dashboard → Storage
2. Create new Postgres database
3. Copy connection strings to environment variables
4. Run database initialization:
```bash
# Connect to Vercel project
vercel link

# Push database schema
vercel env pull .env.local
npm run seed  # Only if you want mock data
```

### Step 5: Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Step 6: Deploy
```bash
# Deploy to production
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

## 🌐 Custom Domain Setup

### In Vercel:
1. Go to Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### DNS Records:
```
Type  Name    Value
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

## 📊 Post-Deployment Setup

### 1. Test Payment Flow
- Make a test donation using Stripe test card: `4242 4242 4242 4242`
- Verify webhook receives event
- Check database for donation record
- Confirm email is sent

### 2. Configure Admin Access
```bash
# Generate secure password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-secure-password', 10))"

# Update environment variables:
ADMIN_USERNAME=your-username
ADMIN_PASSWORD_HASH=generated-hash
```

### 3. Set Up Monitoring
- Enable Vercel Analytics
- Configure Google Analytics
- Set up error tracking (Sentry recommended)
- Configure uptime monitoring

### 4. Email Configuration
1. Verify domain in Resend dashboard
2. Update DNS records for email sending
3. Test email delivery

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure CSP headers
- [ ] Enable Vercel DDoS protection
- [ ] Regular security audits

## 📝 Manual Deployment (Alternative)

### Requirements:
- Node.js 18+
- PostgreSQL database
- PM2 or similar process manager

### Steps:
```bash
# 1. Clone repository
git clone https://github.com/your-repo/save-jose-gomes.git
cd save-jose-gomes

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env.local
# Edit .env.local with production values

# 4. Build application
npm run build

# 5. Run database migrations
npm run seed  # Only for initial setup

# 6. Start with PM2
pm2 start npm --name "jose-gomes-fund" -- start
pm2 save
pm2 startup
```

## 🔄 Updates and Maintenance

### Deploy Updates:
```bash
# Vercel (automatic with git push)
git push origin main

# Manual
git pull
npm install
npm run build
pm2 restart jose-gomes-fund
```

### Database Backup:
```bash
# Export data
pg_dump $POSTGRES_URL > backup-$(date +%Y%m%d).sql

# Import data
psql $POSTGRES_URL < backup.sql
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (18+)
   - Clear cache: `rm -rf .next node_modules`
   - Reinstall: `npm install`

2. **Database Connection Error**
   - Verify `POSTGRES_URL` is correct
   - Check SSL requirements
   - Ensure database is accessible

3. **Stripe Webhooks Not Working**
   - Verify webhook secret
   - Check endpoint URL
   - Review Stripe webhook logs

4. **Emails Not Sending**
   - Verify Resend API key
   - Check domain verification
   - Review email logs in Resend

## 📞 Support Contacts

### Service Support:
- Vercel: support.vercel.com
- Stripe: support.stripe.com
- Resend: resend.com/support

### Emergency Contacts:
- Technical Lead: [your-email]
- Database Admin: [admin-email]

## 📊 Performance Optimization

### Recommended Settings:
```javascript
// next.config.ts
export default {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### CDN Configuration:
- Enable Vercel Edge Network
- Configure cache headers
- Use image optimization

## 🔄 Rollback Procedure

If issues occur after deployment:

```bash
# Vercel
vercel rollback

# Manual
git checkout previous-commit-hash
npm run build
pm2 restart jose-gomes-fund
```

## 📈 Monitoring Setup

### Essential Metrics:
- Response time < 200ms
- Error rate < 1%
- Uptime > 99.9%
- Successful payment rate

### Alerts to Configure:
- Payment failures
- High error rate
- Database connection issues
- Low disk space

---

## Final Notes

- Always test in staging before production
- Keep backups of database and environment variables
- Document any custom configurations
- Monitor first 24 hours after deployment closely

For urgent issues, contact the development team immediately.