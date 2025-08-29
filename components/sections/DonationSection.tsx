'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { CreditCard, Heart, Building2, Smartphone } from 'lucide-react'

export function DonationSection() {
  const t = useTranslations('donation')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const presetAmounts = [25, 50, 100, 250, 500, 1000]
  
  const paymentMethods = [
    { id: 'card', name: t('card'), icon: CreditCard, available: false },
    { id: 'paypal', name: t('paypal'), icon: Heart, available: false },
    { id: 'pix', name: t('pix'), icon: Smartphone, available: true },
    { id: 'mbway', name: t('mbway'), icon: Smartphone, available: true },
    { id: 'bank', name: t('bankTransfer'), icon: Building2, available: true },
  ]
  
  return (
    <section id="donation" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('title')}
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('selectAmount')}
              </label>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-blue-600 text-white shadow-lg'
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
              />
            </div>
            
            {/* Anonymous Option */}
            <div className="mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">{t('anonymous')}</span>
              </label>
            </div>
            
            {/* Payment Methods */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('selectPayment')}
              </label>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 ${
                      method.available 
                        ? 'border-gray-200 bg-white' 
                        : 'border-gray-100 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <method.icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                      {!method.available && (
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      )}
                    </div>
                    
                    {/* Show payment instructions for available methods */}
                    {method.available && method.id === 'pix' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                        <p>PIX Key: {process.env.NEXT_PUBLIC_PIX_KEY || 'Will be provided'}</p>
                      </div>
                    )}
                    
                    {method.available && method.id === 'mbway' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                        <p>MB Way Entity: {process.env.NEXT_PUBLIC_MBWAY_ENTITY || 'Will be provided'}</p>
                      </div>
                    )}
                    
                    {method.available && method.id === 'bank' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                        <p>Bank transfer details will be provided via email</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              disabled={!selectedAmount && !customAmount}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
            >
              {t('processing')}
            </button>
            
            {/* Disclaimer */}
            <p className="mt-6 text-xs text-center text-gray-500">
              {t.rich('disclaimer', {
                privacy: () => <span className="font-medium">{t('privacy')}</span>
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}