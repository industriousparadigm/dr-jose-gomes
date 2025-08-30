import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createDonation } from '@/lib/db/donations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, donorEmail, donorName, message, isAnonymous, locale } = body

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      amount,
      donorEmail,
      donorName,
      message,
      isAnonymous,
      locale,
    })

    // Create pending donation record
    const donation = await createDonation({
      amount,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: session.id,
      donor_name: isAnonymous ? null : donorName,
      donor_email: isAnonymous ? null : donorEmail,
      donor_message: message,
      is_anonymous: isAnonymous || false,
      is_message_public: !isAnonymous,
      status: 'pending',
      ip_country: request.headers.get('x-vercel-ip-country') || undefined,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      donationId: donation.id,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}