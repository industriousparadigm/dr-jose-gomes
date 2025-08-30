# Testing Guide

This document provides comprehensive information about the testing setup and strategies for the Dr. José Gomes crowdfunding platform.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Requirements](#coverage-requirements)
- [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy follows the testing pyramid approach:

- **Unit Tests (Many)**: Fast, isolated tests for utilities, helpers, and individual functions
- **Integration Tests (Some)**: Tests for API endpoints, database operations, and component integration
- **E2E Tests (Few)**: End-to-end user journey tests for critical paths

### Tech Stack

- **Jest**: JavaScript testing framework for unit and integration tests
- **Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing framework
- **MSW (Mock Service Worker)**: API mocking for tests
- **Husky**: Git hooks for running tests on commit

## Test Structure

```
├── __tests__/                     # Global test utilities and setup
├── tests/
│   ├── fixtures/                  # Test data fixtures
│   ├── mocks/                     # Mock implementations
│   └── utils/                     # Test utility functions
├── lib/
│   └── **/__tests__/              # Unit tests for utilities
├── components/
│   └── **/__tests__/              # Component tests
├── app/api/
│   └── **/__tests__/              # API route tests
└── e2e/                          # End-to-end tests
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npm run test:setup

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

### Individual Test Files

```bash
# Run specific test file
npm test -- DonationForm.test.tsx

# Run tests matching pattern
npm test -- --testPathPattern="donation"

# Run tests in specific directory
npm test -- components/
```

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and utilities:

```typescript
// lib/utils/__tests__/format.test.ts
import { formatCurrency } from '../format'

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100')
  })

  it('should handle edge cases', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0')
    expect(formatCurrency(-50, 'USD')).toBe('-$50')
  })
})
```

### Component Tests

Component tests verify UI behavior and user interactions:

```typescript
// components/donation/__tests__/DonationForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationForm } from '../DonationForm'

test('should handle form submission', async () => {
  const user = userEvent.setup()
  render(<DonationForm />)
  
  await user.click(screen.getByText('$50'))
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.click(screen.getByRole('button', { name: /donate/i }))
  
  expect(mockFetch).toHaveBeenCalledWith('/api/donations/create-checkout', {
    method: 'POST',
    // ... expected payload
  })
})
```

### API Tests

API tests verify endpoint behavior and error handling:

```typescript
// app/api/donations/create-checkout/__tests__/route.test.ts
import { POST } from '../route'
import { NextRequest } from 'next/server'

test('should create checkout session successfully', async () => {
  const request = new NextRequest('http://localhost/api/donations/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ amount: 100 })
  })

  const response = await POST(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.sessionId).toBeDefined()
})
```

### E2E Tests

E2E tests verify complete user journeys:

```typescript
// e2e/donation-flow.spec.ts
import { test, expect } from '@playwright/test'

test('should complete donation flow', async ({ page }) => {
  await page.goto('/')
  await page.getByText('$50').click()
  await page.getByLabel(/name/i).fill('Test Donor')
  await page.getByRole('button', { name: /donate/i }).click()
  
  await expect(page.url()).toContain('checkout.stripe.com')
})
```

## Test Categories

### Critical Path Tests ✅

These tests cover the most important user journeys and must pass:

- Donation creation and checkout flow
- Stripe payment processing
- Database operations (donations, stats)
- Language switching functionality
- Admin authentication and dashboard

### Error Handling Tests ⚠️

Tests that verify graceful error handling:

- Network failures
- API errors
- Invalid input validation
- CSP violations
- Database connection issues

### Edge Case Tests 🔍

Tests for unusual but possible scenarios:

- Zero/negative amounts
- Very large donations
- Missing translation keys
- Concurrent admin sessions
- Mobile responsiveness

## Mock Strategy

### Stripe Mocking

```typescript
// tests/mocks/stripe.ts
export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      })
    }
  }
}
```

### Database Mocking

```typescript
// tests/utils/test-db.ts
export const mockDatabase = {
  donations: [/* test data */],
  stats: { total_raised: 1500, donor_count: 15 }
}
```

### API Mocking with MSW

```typescript
// tests/mocks/handlers.ts
export const handlers = [
  http.post('/api/donations/create-checkout', () => {
    return HttpResponse.json({ sessionId: 'cs_test_123' })
  })
]
```

## Coverage Requirements

### Minimum Coverage Thresholds

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Coverage Goals by Area

- **Utilities/Helpers**: 95%+ coverage
- **API Endpoints**: 85%+ coverage  
- **Components**: 75%+ coverage
- **Database Functions**: 85%+ coverage

### Files Excluded from Coverage

- Configuration files
- Type definitions
- Test files themselves
- Generated files (Next.js routes)

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Release tags

### Test Pipeline

1. **Lint Check**: ESLint validation
2. **Unit Tests**: Jest with coverage
3. **E2E Tests**: Playwright browser tests
4. **Security Scan**: Dependency audit
5. **Build Test**: Production build verification

### Pre-commit Hooks

Husky runs these checks before each commit:
- Lint-staged formatting
- Related tests for changed files
- Type checking

```bash
# Manual pre-commit check
npm run pre-commit
```

## Troubleshooting

### Common Issues

#### Tests Failing Due to Missing Environment Variables

```bash
# Set required env vars for tests
export NEXT_PUBLIC_SITE_URL=http://localhost:3000
export STRIPE_SECRET_KEY=sk_test_mock
npm run test
```

#### Playwright Browser Installation Issues

```bash
# Reinstall Playwright browsers
npx playwright install --force
```

#### Jest Cache Issues

```bash
# Clear Jest cache
npx jest --clearCache
npm run test
```

#### Mock Service Worker Issues

```bash
# Check MSW is properly configured
# Ensure server.listen() is called in jest.setup.js
```

### Test Performance

#### Slow Test Diagnosis

```bash
# Run tests with performance timing
npm run test -- --verbose --detectSlowTests
```

#### Parallel Test Execution

```bash
# Control Jest workers
npm run test -- --maxWorkers=4
```

### Debugging Tests

#### Debug Individual Tests

```bash
# Debug specific test with Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="DonationForm"
```

#### E2E Test Debugging

```bash
# Run E2E tests with browser UI
npm run test:e2e:ui

# Debug E2E tests step by step
npm run test:e2e:debug
```

## Test Data Management

### Fixtures

Use consistent test data from fixtures:

```typescript
import { donationFixtures } from '../../tests/fixtures/donations'

// Use in tests
const testDonation = donationFixtures.completed
```

### Database Seeding

```typescript
// tests/utils/test-db.ts
export async function seedTestDonations() {
  // Insert test data for integration tests
}
```

## Best Practices

### DO ✅

- Write tests first (TDD approach)
- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Test error conditions
- Keep tests fast and isolated
- Use proper cleanup (afterEach)

### DON'T ❌

- Test implementation details
- Share state between tests
- Use real external services
- Skip error case testing
- Write flaky tests
- Test third-party libraries
- Duplicate test logic

## Performance Guidelines

### Target Execution Times

- Unit tests: < 5ms each
- Component tests: < 50ms each
- Integration tests: < 200ms each
- E2E tests: < 30s total suite
- Full test suite: < 30s (excluding E2E)

### Optimization Tips

1. Use `jest.fn()` instead of complex mocks
2. Minimize DOM operations in tests
3. Use `screen.getBy*` over `container.querySelector`
4. Avoid `waitFor` when not necessary
5. Use `userEvent` over `fireEvent`
6. Mock heavy dependencies
7. Run E2E tests in parallel when possible

## Monitoring and Metrics

### Coverage Reports

Coverage reports are generated in:
- `coverage/lcov-report/index.html` (local)
- Uploaded to Codecov (CI)

### Test Results

- GitHub Actions: Check workflow results
- Local: Jest outputs results to console
- Playwright: HTML report in `playwright-report/`

### Quality Metrics

Track these metrics over time:
- Test coverage percentage
- Test execution time
- Test failure rate
- Flaky test identification

---

## Getting Help

If you encounter testing issues:

1. Check this documentation
2. Review existing test examples
3. Check the troubleshooting section
4. Ask the development team
5. Create an issue with reproduction steps

Remember: **Good tests are documentation of expected behavior!**