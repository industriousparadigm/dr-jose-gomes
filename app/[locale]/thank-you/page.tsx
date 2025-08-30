'use client'

import { CheckCircle, Download, Share2, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ThankYouPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('thank')
  const searchParams = useSearchParams()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  
  const amount = searchParams.get('amount') || '0'
  const donorName = searchParams.get('name') || 'Friend'
  const message = searchParams.get('message') || ''
  const sessionId = searchParams.get('session_id') || ''

  const handleDownloadCertificate = async () => {
    setIsDownloading(true)
    try {
      const { downloadCertificate } = await import('@/components/certificate/DonationCertificate')
      await downloadCertificate({
        donorName,
        amount,
        currency: 'USD',
        date: new Date().toLocaleDateString(),
        message: message || undefined,
        certificateId: sessionId.substring(0, 8) || 'XXXXXX',
        locale: params.locale as 'en' | 'pt'
      })
      toast.success('Certificate downloaded!')
    } catch (error) {
      toast.error('Failed to download certificate')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = () => {
    setIsShareOpen(true)
    // Import and use the share modal
    import('@/components/share/ShareModal').then(({ ShareModal }) => {
      // The modal will handle its own rendering
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t('message')}
          </p>

          {/* Donation Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-500 mb-2">{t('donationReceived')}</p>
            <p className="text-3xl font-bold text-gray-900">
              ${amount}
            </p>
            {donorName !== 'Friend' && (
              <p className="text-sm text-gray-600 mt-2">
                Thank you, {donorName}!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4 mb-8">
            <button 
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? 'Generating...' : t('downloadReceipt')}
            </button>
            
            <button 
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              {t('shareStory')}
            </button>
          </div>

          {/* Personal Message */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-700 italic">
              {t('personalMessage')}
            </p>
            <p className="text-sm text-gray-600 mt-3">
              - {t('fromFamily')}
            </p>
          </div>

          {/* User's Message */}
          {message && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">Your message to Dr. José:</p>
              <p className="text-gray-700 italic">"{message}"</p>
            </div>
          )}

          {/* Return Home */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← {t('returnHome')}
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t('emailConfirmation')}
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50">
          {/* Dynamic import will handle the modal */}
        </div>
      )}
    </div>
  )
}