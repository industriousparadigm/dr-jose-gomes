// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom'

// Polyfill for fetch and other Web APIs
import 'whatwg-fetch'
global.Response = Response
global.Request = Request

// Mock NextResponse for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {})
        }
      })
      response.status = init?.status || 200
      return response
    }
  },
  NextRequest: class NextRequest extends Request {
    constructor(input, init) {
      super(input, init)
    }
  }
}))

// Only import MSW server if it exists and we need it
let server
try {
  const mswModule = require('./tests/mocks/server')
  server = mswModule.server
} catch (error) {
  // MSW not available, skip server setup
  console.log('MSW server not available, skipping mock server setup')
}

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_GOAL_AMOUNT = '25000'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
process.env.POSTGRES_URL = 'postgres://test:test@localhost:5432/test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: () => (key) => key,
  getLocale: () => 'en',
}))

// Setup MSW if available
if (server) {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}