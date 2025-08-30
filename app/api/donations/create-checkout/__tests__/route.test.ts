/**
 * @jest-environment jsdom
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

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
  createCheckoutSession: jest.fn()
}))

jest.mock('@/lib/db/donations', () => ({
  createDonation: jest.fn()
}))

const { createCheckoutSession } = require('@/lib/stripe')
const { createDonation } = require('@/lib/db/donations')

describe('/api/donations/create-checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create checkout session successfully', async () => {
    // Mock successful responses
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_123456',
      url: 'https://checkout.stripe.com/pay/cs_test_123456'
    })

    createDonation.mockResolvedValue({
      id: 'donation_123',
      amount: 100,
      status: 'pending'
    })

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        'x-vercel-ip-country': 'US'
      }),
      body: {
        amount: 100,
        donorEmail: 'test@example.com',
        donorName: 'Test User',
        message: 'Great cause!',
        isAnonymous: false,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      sessionId: 'cs_test_123456',
      url: 'https://checkout.stripe.com/pay/cs_test_123456',
      donationId: 'donation_123'
    })

    expect(createCheckoutSession).toHaveBeenCalledWith({
      amount: 100,
      donorEmail: 'test@example.com',
      donorName: 'Test User',
      message: 'Great cause!',
      isAnonymous: false,
      locale: 'en'
    })

    expect(createDonation).toHaveBeenCalledWith({
      amount: 100,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'cs_test_123456',
      donor_name: 'Test User',
      donor_email: 'test@example.com',
      donor_message: 'Great cause!',
      is_anonymous: false,
      is_message_public: true,
      status: 'pending',
      ip_country: 'US'
    })
  })

  it('should handle anonymous donations', async () => {
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_anonymous',
      url: 'https://checkout.stripe.com/pay/cs_test_anonymous'
    })

    createDonation.mockResolvedValue({
      id: 'donation_anonymous',
      amount: 50,
      status: 'pending'
    })

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: 50,
        donorEmail: 'anonymous@example.com',
        donorName: 'Anonymous User',
        isAnonymous: true,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(createDonation).toHaveBeenCalledWith({
      amount: 50,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'cs_test_anonymous',
      donor_name: null,
      donor_email: null,
      donor_message: undefined,
      is_anonymous: true,
      is_message_public: false,
      status: 'pending',
      ip_country: undefined
    })
  })

  it('should validate amount - reject zero amount', async () => {
    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: 0,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid donation amount')
    expect(createCheckoutSession).not.toHaveBeenCalled()
    expect(createDonation).not.toHaveBeenCalled()
  })

  it('should validate amount - reject negative amount', async () => {
    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: -10,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid donation amount')
  })

  it('should validate amount - reject missing amount', async () => {
    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        donorName: 'Test User',
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid donation amount')
  })

  it('should handle Stripe API errors', async () => {
    createCheckoutSession.mockRejectedValue(new Error('Stripe API error'))

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: 100,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create checkout session')
  })

  it('should handle database errors', async () => {
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_123456',
      url: 'https://checkout.stripe.com/pay/cs_test_123456'
    })

    createDonation.mockRejectedValue(new Error('Database error'))

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: 100,
        locale: 'en'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create checkout session')
  })

  it('should handle Portuguese locale', async () => {
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_pt',
      url: 'https://checkout.stripe.com/pay/cs_test_pt'
    })

    createDonation.mockResolvedValue({
      id: 'donation_pt',
      amount: 75
    })

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-vercel-ip-country': 'BR'
      },
      body: {
        amount: 75,
        donorName: 'João Silva',
        donorEmail: 'joao@example.com',
        message: 'Melhoras!',
        locale: 'pt'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(createCheckoutSession).toHaveBeenCalledWith({
      amount: 75,
      donorName: 'João Silva',
      donorEmail: 'joao@example.com',
      message: 'Melhoras!',
      isAnonymous: undefined,
      locale: 'pt'
    })
  })

  it('should handle large donations', async () => {
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_large',
      url: 'https://checkout.stripe.com/pay/cs_test_large'
    })

    createDonation.mockResolvedValue({
      id: 'donation_large',
      amount: 5000
    })

    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: {
        amount: 5000,
        donorEmail: 'generous@example.com',
        donorName: 'Generous Donor',
        locale: 'en'
      }
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('should handle malformed JSON', async () => {
    const request = createMockRequest('http://localhost:3000/api/donations/create-checkout', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create checkout session')
  })
})