'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { motion, AnimatePresence } from 'framer-motion'

interface Donation {
  id: string
  amount: number
  currency: string
  donor_name?: string
  message?: string
  created_at: string
  is_anonymous: boolean
}

interface DonationFeedProps {
  initialDonations: Donation[]
  locale: string
}

export function DonationFeed({ initialDonations, locale }: DonationFeedProps) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [isLoading, setIsLoading] = useState(false)

  // Poll for new donations every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/donations/recent')
        if (response.ok) {
          const newDonations = await response.json()
          setDonations(newDonations)
        }
      } catch (error) {
        console.error('Error fetching donations:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getDonorDisplay = (donation: Donation) => {
    if (donation.is_anonymous) {
      return locale === 'pt' ? 'Anônimo' : 'Anonymous'
    }
    return donation.donor_name || (locale === 'pt' ? 'Apoiador' : 'Supporter')
  }

  const getTimeAgo = (date: string) => {
    const distance = formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: locale === 'pt' ? require('date-fns/locale/pt-BR') : undefined
    })
    return distance
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {locale === 'pt' ? 'Seja o primeiro a contribuir!' : 'Be the first to contribute!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          {locale === 'pt' ? 'Doações Recentes' : 'Recent Donations'}
        </h3>
        <span className="text-sm text-gray-500">
          {donations.length} {locale === 'pt' ? 'doações' : 'donations'}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {donations.slice(0, 10).map((donation, index) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {getDonorDisplay(donation)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(donation.created_at)}
                    </span>
                  </div>
                  
                  {donation.message && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-gray-400 inline mr-2" />
                      <span className="text-sm text-gray-700 italic">
                        "{donation.message}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(donation.amount)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {donations.length > 10 && (
        <div className="text-center pt-4">
          <button
            onClick={() => {/* Load more logic */}}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {locale === 'pt' ? 'Ver mais doações' : 'View more donations'} →
          </button>
        </div>
      )}
    </div>
  )
}