'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Facebook, Twitter, Mail, Copy, Check, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText = t('message')
  const shareTitle = t('title')

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedText}%20${encodedUrl}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
      
      // Track share event
      import('@/components/analytics/GoogleAnalytics').then(({ trackShare }) => {
        trackShare(platform)
      })
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('linkCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('message')}
        </p>

        {/* Share Options */}
        <div className="space-y-3">
          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1664d8] transition-colors"
          >
            <Facebook className="w-5 h-5" />
            {t('facebook')}
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
          >
            <Twitter className="w-5 h-5" />
            {t('twitter')}
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t('whatsapp')}
          </button>

          <button
            onClick={() => handleShare('email')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            {t('email')}
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-600">{t('linkCopied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t('copyLink')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}