# Claude Development Guidelines

## 🚨 CRITICAL: Always Run These Before Saying "Done"

```bash
# 1. Database Setup (if not already done)
npm run db:setup

# 2. Run Tests
npm test

# 3. Start Dev Server and Check for Errors
npm run dev
# Open http://localhost:3000 and check browser console

# 4. Test Critical User Flows Manually
# - Click "Donate Now" button
# - Switch languages
# - Submit a form
```

## Testing Infrastructure

### Test Stack
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking
- **@vercel/postgres** - Uses SQL template literals (tagged templates)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- donations.test.ts
```

### Test File Structure

```
__tests__/              # Test files next to source
├── components/         # Component tests
├── api/               # API route tests
├── lib/               # Utility tests
└── e2e/               # End-to-end tests

tests/                  # Shared test utilities
├── fixtures/          # Test data
├── mocks/            # Mock implementations
└── utils/            # Test helpers
```

## Common Issues and Solutions

### 1. CSP Blocking Stripe

**Problem**: Content Security Policy blocks Stripe scripts
**Solution**: Already fixed in `/lib/security.ts` - includes js.stripe.com

### 2. Database Tables Missing

**Problem**: "relation 'donations' does not exist"
**Solution**: 
```bash
npm run db:setup  # Creates all required tables
```

### 3. Missing Translation Keys

**Problem**: MISSING_MESSAGE errors
**Solution**: Always check both locale files:
```bash
# Check for missing keys
grep -r "useTranslations\|t(" components/ | grep -oE "t\('[^']+'\)" | sort -u

# Verify key exists in both files
cat messages/en.json | jq '.donation'
cat messages/pt.json | jq '.donation'
```

### 4. Client/Server Component Mismatch

**Rule**: Any component with event handlers needs 'use client'
```tsx
// Quick check for event handlers
grep -r "onClick\|onChange\|onSubmit" components/ --include="*.tsx"
```

## Writing Tests - AI Agent Guidelines

### Component Test Template

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from './ComponentName'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('expected.text')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // Assert expected behavior
  })
})
```

### API Route Test Template

```tsx
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock external dependencies
jest.mock('@/lib/stripe')

describe('API Route', () => {
  it('should handle valid request', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('success')
  })
})
```

## Pre-Deployment Checklist

### Essential Checks

- [ ] **Database Setup**
  ```bash
  npm run db:setup
  ```

- [ ] **Environment Variables**
  ```bash
  # Check all required vars are set
  node -e "require('dotenv').config(); ['POSTGRES_URL', 'STRIPE_SECRET_KEY'].forEach(k => console.log(k, ':', !!process.env[k]))"
  ```

- [ ] **Run Tests**
  ```bash
  npm test
  ```

- [ ] **Build Successfully**
  ```bash
  npm run build
  ```

- [ ] **No Console Errors**
  - Start dev server: `npm run dev`
  - Open browser console
  - Navigate through all pages
  - Test all interactions

## Quick Fixes for Common Errors

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Database connection failed"
```bash
# Check connection string
echo $POSTGRES_URL
# Ensure it's set in .env.local
```

### Error: "Stripe is not defined"
```bash
# Check if Stripe key is set
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Ensure CSP allows Stripe
grep "js.stripe.com" lib/security.ts
```

### Error: "Missing translation"
```bash
# Add to both locale files
echo "Check messages/en.json and messages/pt.json"
```

## Performance Optimization

### Keep Tests Fast

1. **Use mocks** instead of real API calls
2. **Parallelize** test execution
3. **Skip E2E** in watch mode
4. **Cache** dependencies

### Database Test Optimization

```typescript
// Use transactions for test isolation
beforeEach(async () => {
  await sql`BEGIN`
})

afterEach(async () => {
  await sql`ROLLBACK`
})
```

### Testing @vercel/postgres SQL Template Literals

**IMPORTANT**: The `sql` function from @vercel/postgres is a tagged template literal that receives:
1. First argument: Array of template string parts
2. Subsequent arguments: Interpolated values

```typescript
// WRONG way to mock (will fail):
expect(sql).toHaveBeenCalledWith(
  expect.arrayContaining([
    expect.stringContaining('INSERT INTO donations')
  ])
)

// CORRECT way to mock:
expect(sql).toHaveBeenCalled()
const callArgs = sql.mock.calls[0]
// callArgs[0] is array of template parts
// callArgs[1], callArgs[2], etc. are interpolated values
expect(callArgs[0][0]).toContain('INSERT INTO donations')
expect(callArgs[1]).toBe(100) // First interpolated value
expect(callArgs[2]).toBe('USD') // Second interpolated value
```

Example of actual call signature:
```typescript
// When you write:
sql`INSERT INTO donations (amount) VALUES (${100})`

// It's called as:
sql(['INSERT INTO donations (amount) VALUES (', ')'], 100)
```

## Debugging Tips

### Enable Verbose Logging

```bash
# For tests
DEBUG=* npm test

# For development
DEBUG=stripe:* npm run dev
```

### Check Component Rendering

```tsx
// Add temporary debug output
console.log('Component rendered with props:', props)
```

### Verify API Routes

```bash
# Test API directly
curl -X POST http://localhost:3000/api/donations/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

## Required NPM Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:setup": "tsx scripts/setup-db.ts",
    "db:seed": "tsx scripts/seed-donations.ts",
    "lint": "eslint",
    "type-check": "tsc --noEmit"
  }
}
```

## Testing Strategy Summary

1. **Unit Tests**: All utilities and helpers
2. **Integration Tests**: API routes and database operations
3. **Component Tests**: Critical UI components
4. **E2E Tests**: Complete user flows

## Red Flags - Stop and Fix

1. ❌ **No tests passing** - Don't proceed
2. ❌ **Console errors** - Fix immediately
3. ❌ **Build failures** - Resolve before continuing
4. ❌ **Missing env vars** - Set up completely
5. ❌ **Database errors** - Run setup script

## Green Flags - Good to Go

1. ✅ All tests passing
2. ✅ No console errors
3. ✅ Build succeeds
4. ✅ Can complete donation flow
5. ✅ Language switching works
6. ✅ Database queries succeed

## Remember

- **Test First**: Write tests before implementation when possible
- **Test Often**: Run tests after every significant change
- **Test Everything**: If it can break, it needs a test
- **Mock External Services**: Don't rely on external APIs in tests
- **Keep Tests Fast**: Sub-30 second test suite
- **Document Failures**: When tests fail, document why and how to fix

## Final Verification

Before marking any task complete:

```bash
# The Ultimate Check
npm test && npm run build && echo "✅ Ready to ship!"
```

If this fails, **DO NOT** say the task is complete!