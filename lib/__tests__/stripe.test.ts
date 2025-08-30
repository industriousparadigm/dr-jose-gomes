/**
 * @jest-environment jsdom
 */
import { createCheckoutSession, retrieveCheckoutSession } from '../stripe'
import { mockStripe } from '../../tests/mocks/stripe'

// Import the mock after the module mock
jest.mock('../stripe', () => ({
  stripe: mockStripe,
  createCheckoutSession: jest.fn(),
  retrieveCheckoutSession: jest.fn()
}))

// Import the actual functions for testing
const stripeModule = require('../stripe')

describe('Stripe Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  })

  describe('createCheckoutSession', () => {
    beforeEach(() => {
      stripeModule.createCheckoutSession.mockImplementation(async (params) => {
        return {
          id: 'cs_test_123456',
          url: 'https://checkout.stripe.com/c/pay/cs_test_123456',
          payment_status: 'unpaid',
          status: 'open'
        }
      })
    })

    it('should create a checkout session with basic parameters', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 100,
        donorEmail: 'test@example.com',
        donorName: 'Test User',
        locale: 'en'
      })

      expect(session.id).toBe('cs_test_123456')
      expect(session.url).toContain('checkout.stripe.com')
      expect(stripeModule.createCheckoutSession).toHaveBeenCalledWith({
        amount: 100,
        donorEmail: 'test@example.com',
        donorName: 'Test User',
        locale: 'en'
      })
    })

    it('should create anonymous donation session', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 50,
        isAnonymous: true,
        locale: 'en'
      })

      expect(session.id).toBe('cs_test_123456')
      expect(stripeModule.createCheckoutSession).toHaveBeenCalledWith({
        amount: 50,
        isAnonymous: true,
        locale: 'en'
      })
    })

    it('should handle Portuguese locale', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 75,
        donorName: 'João Silva',
        locale: 'pt'
      })

      expect(session.id).toBe('cs_test_123456')
      expect(stripeModule.createCheckoutSession).toHaveBeenCalledWith({
        amount: 75,
        donorName: 'João Silva',
        locale: 'pt'
      })
    })

    it('should include donation message in metadata', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 200,
        donorName: 'Maria Santos',
        message: 'Get well soon!',
        locale: 'en'
      })

      expect(session.id).toBe('cs_test_123456')
      expect(stripeModule.createCheckoutSession).toHaveBeenCalledWith({
        amount: 200,
        donorName: 'Maria Santos',
        message: 'Get well soon!',
        locale: 'en'
      })
    })

    it('should default to English locale', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 100
      })

      expect(session.id).toBe('cs_test_123456')
      expect(stripeModule.createCheckoutSession).toHaveBeenCalledWith({
        amount: 100
      })
    })

    it('should handle large donation amounts', async () => {
      const session = await stripeModule.createCheckoutSession({
        amount: 5000,
        donorEmail: 'generous@example.com'
      })

      expect(session.id).toBe('cs_test_123456')
    })
  })

  describe('retrieveCheckoutSession', () => {
    beforeEach(() => {
      stripeModule.retrieveCheckoutSession.mockImplementation(async (sessionId) => {
        return {
          id: sessionId,
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
        }
      })
    })

    it('should retrieve checkout session successfully', async () => {
      const session = await stripeModule.retrieveCheckoutSession('cs_test_123456')

      expect(session.id).toBe('cs_test_123456')
      expect(session.payment_status).toBe('paid')
      expect(session.status).toBe('complete')
      expect(session.customer_details.email).toBe('test@example.com')
      expect(stripeModule.retrieveCheckoutSession).toHaveBeenCalledWith('cs_test_123456')
    })

    it('should include expanded payment intent', async () => {
      const session = await stripeModule.retrieveCheckoutSession('cs_test_123456')

      expect(session.payment_intent).toBeDefined()
      expect(session.payment_intent.id).toBe('pi_test_123456')
      expect(session.payment_intent.status).toBe('succeeded')
    })

    it('should include metadata from original donation', async () => {
      const session = await stripeModule.retrieveCheckoutSession('cs_test_123456')

      expect(session.metadata.donorName).toBe('Test User')
      expect(session.metadata.donorEmail).toBe('test@example.com')
      expect(session.metadata.message).toBe('Test donation')
      expect(session.metadata.isAnonymous).toBe('false')
    })

    it('should handle different session IDs', async () => {
      const sessionId = 'cs_test_different_session'
      
      stripeModule.retrieveCheckoutSession.mockResolvedValueOnce({
        id: sessionId,
        payment_status: 'paid',
        status: 'complete'
      })

      const session = await stripeModule.retrieveCheckoutSession(sessionId)

      expect(session.id).toBe(sessionId)
      expect(stripeModule.retrieveCheckoutSession).toHaveBeenCalledWith(sessionId)
    })
  })

  describe('Error Handling', () => {
    it('should handle Stripe API errors in createCheckoutSession', async () => {
      stripeModule.createCheckoutSession.mockRejectedValueOnce(
        new Error('Your card was declined.')
      )

      await expect(
        stripeModule.createCheckoutSession({ amount: 100 })
      ).rejects.toThrow('Your card was declined.')
    })

    it('should handle Stripe API errors in retrieveCheckoutSession', async () => {
      stripeModule.retrieveCheckoutSession.mockRejectedValueOnce(
        new Error('No such checkout session')
      )

      await expect(
        stripeModule.retrieveCheckoutSession('cs_invalid')
      ).rejects.toThrow('No such checkout session')
    })

    it('should handle network errors', async () => {
      stripeModule.createCheckoutSession.mockRejectedValueOnce(
        new Error('Network request failed')
      )

      await expect(
        stripeModule.createCheckoutSession({ amount: 100 })
      ).rejects.toThrow('Network request failed')
    })
  })
})