'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000]

export function DonationForm() {
  const t = useTranslations('donation')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDonation = async () => {
    const amount = selectedAmount || parseFloat(customAmount)
    
    if (!amount || amount < 1) {
      toast.error('Please select or enter a valid amount')
      return
    }

    setIsProcessing(true)

    try {
      // Create checkout session
      const response = await fetch('/api/donations/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donorEmail: isAnonymous ? undefined : donorEmail,
          donorName: isAnonymous ? undefined : donorName,
          message,
          isAnonymous,
          locale: 'en', // TODO: Get from context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Donation error:', error)
      toast.error('Failed to process donation. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('selectAmount')}
        </label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount)
                setCustomAmount('')
              }}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                selectedAmount === amount
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder={t('customAmount')}
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value)
            setSelectedAmount(null)
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
        />
      </div>

      {/* Donor Information */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700">{t('anonymous')}</span>
        </label>

        {!isAnonymous && (
          <>
            <input
              type="text"
              placeholder={t('yourName')}
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder={t('yourEmail')}
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </>
        )}

        <textarea
          placeholder={t('message')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleDonation}
        disabled={isProcessing}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('processing')}
          </>
        ) : (
          t('donateNow')
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-center text-gray-500">
        {t('disclaimer')}
      </p>
    </div>
  )
}