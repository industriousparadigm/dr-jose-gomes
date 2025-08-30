/**
 * @jest-environment jsdom
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { createMockWebhookEvent } from '../../../../../tests/mocks/stripe'

// Helper function to create mock requests that work properly with Jest
function createMockRequest(url: string, options?: { method?: string; headers?: any; body?: any }) {
  return {
    url,
    method: options?.method || 'GET',
    headers: options?.headers || new Headers(),
    json: async () => options?.body || {},
    text: async () => JSON.stringify(options?.body || {}),
    nextUrl: new URL(url)
  } as any
}

// Mock NextResponse for Next.js API routes
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200
    }))
  }
}))

// Mock the dependencies
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn()
    }
  }
}))

jest.mock('@/lib/db/donations', () => ({
  updateDonationStatusByProcessorId: jest.fn()
}))

jest.mock('@/lib/db/audit', () => ({
  logDonationEvent: jest.fn()
}))

jest.mock('@/lib/email', () => ({
  sendDonationConfirmation: jest.fn()
}))

const { updateDonationStatusByProcessorId } = require('@/lib/db/donations')
const { logDonationEvent } = require('@/lib/db/audit')
const { sendDonationConfirmation } = require('@/lib/email')
const { stripe: mockStripe } = require('@/lib/stripe')

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  it('should handle checkout.session.completed event', async () => {
    const sessionData = {
      id: 'cs_test_123456',
      amount_total: 10000, // $100.00 in cents
      customer_email: 'test@example.com',
      metadata: {
        donor_name: 'John Doe',
        message: 'Get well soon!'
      }
    }

    const event = createMockWebhookEvent('checkout.session.completed', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockResolvedValue(undefined)
    logDonationEvent.mockResolvedValue(undefined)
    sendDonationConfirmation.mockResolvedValue(true)

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)

    expect(updateDonationStatusByProcessorId).toHaveBeenCalledWith('cs_test_123456', 'completed')
    expect(logDonationEvent).toHaveBeenCalledWith('completed', {
      sessionId: 'cs_test_123456',
      amount: 10000,
      customerEmail: 'test@example.com'
    })
    expect(sendDonationConfirmation).toHaveBeenCalledWith(
      'test@example.com',
      'John Doe',
      '$100.00',
      'Get well soon!'
    )
  })

  it('should handle checkout.session.completed without email', async () => {
    const sessionData = {
      id: 'cs_test_no_email',
      amount_total: 5000,
      customer_email: null,
      metadata: {}
    }

    const event = createMockWebhookEvent('checkout.session.completed', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockResolvedValue(undefined)
    logDonationEvent.mockResolvedValue(undefined)

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(updateDonationStatusByProcessorId).toHaveBeenCalledWith('cs_test_no_email', 'completed')
    expect(logDonationEvent).toHaveBeenCalled()
    expect(sendDonationConfirmation).not.toHaveBeenCalled()
  })

  it('should handle checkout.session.expired event', async () => {
    const sessionData = {
      id: 'cs_test_expired',
      amount_total: 2500
    }

    const event = createMockWebhookEvent('checkout.session.expired', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockResolvedValue(undefined)
    logDonationEvent.mockResolvedValue(undefined)

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(updateDonationStatusByProcessorId).toHaveBeenCalledWith('cs_test_expired', 'failed')
    expect(logDonationEvent).toHaveBeenCalledWith('failed', { sessionId: 'cs_test_expired' })
    expect(sendDonationConfirmation).not.toHaveBeenCalled()
  })

  it('should handle unrecognized event types', async () => {
    const event = createMockWebhookEvent('payment_intent.created', { id: 'pi_test_123' })
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled event type: payment_intent.created')
    expect(updateDonationStatusByProcessorId).not.toHaveBeenCalled()
    expect(logDonationEvent).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should reject request without signature', async () => {
    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: { type: 'test' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No signature')
    expect(mockStripe.webhooks.constructEvent).not.toHaveBeenCalled()
  })

  it('should handle invalid signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'invalid_signature'
      }),
      body: { type: 'test' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Webhook signature verification failed:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle database errors gracefully', async () => {
    const sessionData = {
      id: 'cs_test_db_error',
      amount_total: 5000,
      customer_email: 'test@example.com'
    }

    const event = createMockWebhookEvent('checkout.session.completed', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockRejectedValue(new Error('Database connection failed'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Webhook handler failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing webhook:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle email sending errors gracefully', async () => {
    const sessionData = {
      id: 'cs_test_email_error',
      amount_total: 7500,
      customer_email: 'test@example.com',
      metadata: {
        donor_name: 'Jane Smith'
      }
    }

    const event = createMockWebhookEvent('checkout.session.completed', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockResolvedValue(undefined)
    logDonationEvent.mockResolvedValue(undefined)
    sendDonationConfirmation.mockRejectedValue(new Error('Email service unavailable'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Webhook handler failed')

    // Donation should still be updated even if email fails
    expect(updateDonationStatusByProcessorId).toHaveBeenCalledWith('cs_test_email_error', 'completed')
    expect(logDonationEvent).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should handle metadata with missing donor name', async () => {
    const sessionData = {
      id: 'cs_test_no_name',
      amount_total: 3000,
      customer_email: 'anonymous@example.com',
      metadata: {
        message: 'Anonymous donation'
      }
    }

    const event = createMockWebhookEvent('checkout.session.completed', sessionData)
    mockStripe.webhooks.constructEvent.mockReturnValue(event)

    updateDonationStatusByProcessorId.mockResolvedValue(undefined)
    logDonationEvent.mockResolvedValue(undefined)
    sendDonationConfirmation.mockResolvedValue(true)

    const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: new Headers({
        'stripe-signature': 'test_signature'
      }),
      body: event
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(sendDonationConfirmation).toHaveBeenCalledWith(
      'anonymous@example.com',
      'Friend', // Default name when donor_name is missing
      '$30.00',
      'Anonymous donation'
    )
  })

  it('should format amount correctly for different values', async () => {
    const testCases = [
      { amount: 1, expected: '$0.01' },
      { amount: 100, expected: '$1.00' },
      { amount: 999, expected: '$9.99' },
      { amount: 10000, expected: '$100.00' },
      { amount: 123456, expected: '$1234.56' }
    ]

    for (const testCase of testCases) {
      const sessionData = {
        id: `cs_test_${testCase.amount}`,
        amount_total: testCase.amount,
        customer_email: 'test@example.com',
        metadata: { donor_name: 'Test User' }
      }

      const event = createMockWebhookEvent('checkout.session.completed', sessionData)
      mockStripe.webhooks.constructEvent.mockReturnValue(event)

      updateDonationStatusByProcessorId.mockResolvedValue(undefined)
      logDonationEvent.mockResolvedValue(undefined)
      sendDonationConfirmation.mockResolvedValue(true)

      const request = createMockRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: new Headers({
          'stripe-signature': 'test_signature'
        }),
        body: event
      })

      await POST(request)

      expect(sendDonationConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        testCase.expected,
        undefined
      )

      jest.clearAllMocks()
    }
  })
})