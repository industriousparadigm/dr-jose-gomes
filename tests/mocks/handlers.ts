import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Stripe API endpoints
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_123456',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123456',
      payment_status: 'unpaid',
      status: 'open',
      metadata: {},
      customer_email: null,
    })
  }),

  http.get('https://api.stripe.com/v1/checkout/sessions/:sessionId', ({ params }) => {
    const { sessionId } = params
    return HttpResponse.json({
      id: sessionId,
      payment_status: 'paid',
      status: 'complete',
      amount_total: 10000, // $100.00
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
  }),

  // Mock webhook endpoint
  http.post('/api/webhooks/stripe', () => {
    return HttpResponse.json({ received: true })
  }),

  // Mock donation endpoints
  http.post('/api/donations/create-checkout', () => {
    return HttpResponse.json({
      sessionId: 'cs_test_123456',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123456',
      donationId: '550e8400-e29b-41d4-a716-446655440000'
    })
  }),

  http.get('/api/donations/recent', () => {
    return HttpResponse.json([
      {
        id: '1',
        amount: 100,
        currency: 'USD',
        donor_name: 'John Doe',
        message: 'Great cause!',
        created_at: new Date().toISOString()
      }
    ])
  }),

  // Mock email service
  http.post('https://api.resend.com/emails', () => {
    return HttpResponse.json({
      id: 'email_test_123',
      from: 'noreply@example.com',
      to: 'test@example.com',
      subject: 'Test Email',
      created_at: new Date().toISOString()
    })
  })
]