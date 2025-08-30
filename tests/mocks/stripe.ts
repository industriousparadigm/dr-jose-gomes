/**
 * Stripe mocks for testing
 */
import type Stripe from 'stripe'

export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123456',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123456',
        payment_status: 'unpaid',
        status: 'open',
        metadata: {},
        customer_email: null,
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_test_123456',
        payment_status: 'paid',
        status: 'complete',
        amount_total: 10000,
        currency: 'usd',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User'
        },
        metadata: {
          donorName: 'Test User',
          donorEmail: 'test@example.com',
          message: 'Test donation',
          isAnonymous: 'false'
        },
        payment_intent: {
          id: 'pi_test_123456',
          status: 'succeeded'
        }
      })
    }
  },
  webhooks: {
    constructEvent: jest.fn().mockReturnValue({
      id: 'evt_test_webhook',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123456',
          payment_status: 'paid',
          metadata: {
            donorName: 'Test User',
            donorEmail: 'test@example.com'
          }
        }
      }
    })
  }
}

// Mock the entire stripe module
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe)
})

// Mock stripe configuration
jest.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test_123456',
    url: 'https://checkout.stripe.com/c/pay/cs_test_123456'
  }),
  retrieveCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test_123456',
    payment_status: 'paid',
    status: 'complete'
  })
}))

export const createMockCheckoutSession = (overrides: Partial<Stripe.Checkout.Session> = {}) => ({
  id: 'cs_test_123456',
  object: 'checkout.session',
  payment_status: 'paid',
  status: 'complete',
  amount_total: 10000,
  currency: 'usd',
  customer_details: {
    email: 'test@example.com',
    name: 'Test User'
  },
  metadata: {
    donorName: 'Test User',
    donorEmail: 'test@example.com',
    message: 'Test donation',
    isAnonymous: 'false'
  },
  ...overrides
})

export const createMockWebhookEvent = (type: string, data: any) => ({
  id: 'evt_test_webhook',
  object: 'event',
  type,
  data: { object: data },
  created: Math.floor(Date.now() / 1000)
})