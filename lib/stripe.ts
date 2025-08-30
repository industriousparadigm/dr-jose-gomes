import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

export async function createCheckoutSession({
  amount,
  donorEmail,
  donorName,
  message,
  isAnonymous,
  locale = 'en',
}: {
  amount: number
  donorEmail?: string
  donorName?: string
  message?: string
  isAnonymous?: boolean
  locale?: string
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: locale === 'pt' ? 'Doação para Dr. José Gomes' : 'Donation for Dr. José Gomes',
            description: locale === 'pt' 
              ? 'Apoio ao tratamento médico' 
              : 'Support for medical treatment',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&name=${encodeURIComponent(donorName || 'Friend')}&message=${encodeURIComponent(message || '')}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    metadata: {
      donorName: donorName || 'Anonymous',
      donorEmail: donorEmail || '',
      message: message || '',
      isAnonymous: String(isAnonymous || false),
    },
    customer_email: donorEmail,
    submit_type: 'donate',
  })

  return session
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  })
  return session
}