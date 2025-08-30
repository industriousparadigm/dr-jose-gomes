import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateDonationStatusByProcessorId } from '@/lib/db/donations'
import { logDonationEvent } from '@/lib/db/audit'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update donation status
        await updateDonationStatusByProcessorId(session.id, 'completed')
        
        // Log the event
        await logDonationEvent('completed', {
          sessionId: session.id,
          amount: session.amount_total,
          customerEmail: session.customer_email,
        })

        // Send confirmation email if email provided
        if (session.customer_email) {
          const { sendDonationConfirmation } = await import('@/lib/email')
          const amount = `$${(session.amount_total! / 100).toFixed(2)}`
          const metadata = session.metadata as any
          
          await sendDonationConfirmation(
            session.customer_email,
            metadata?.donor_name || 'Friend',
            amount,
            metadata?.message
          )
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await updateDonationStatusByProcessorId(session.id, 'failed')
        await logDonationEvent('failed', { sessionId: session.id })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}