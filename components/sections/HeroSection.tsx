'use client'

import { useTranslations } from 'next-intl'
import { Heart, Share2 } from 'lucide-react'
import { Stats } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { useState, useEffect } from 'react'
import { ShareModal } from '@/components/share/ShareModal'

interface HeroSectionProps {
  stats: Stats | null
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations('hero')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const handleDonateClick = () => {
    console.log('[HeroSection] Donate button clicked!')
    const element = document.getElementById('donation')
    console.log('[HeroSection] Donation element found:', !!element)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      console.log('[HeroSection] Scrolling to donation section')
    } else {
      console.error('[HeroSection] Could not find donation section!')
    }
  }

  const handleShareClick = () => {
    console.log('[HeroSection] Share button clicked!')
    setIsShareOpen(true)
  }

  useEffect(() => {
    setIsMounted(true)
    console.log('[HeroSection] Component mounted, buttons should be interactive')

    // Debug: Force attach event listeners if React isn't working
    const donateBtn = document.querySelector('[data-button="donate"]') as HTMLButtonElement
    const shareBtn = document.querySelector('[data-button="share"]') as HTMLButtonElement

    if (donateBtn) {
      console.log('[HeroSection] Found donate button, attaching listener')
      donateBtn.addEventListener('click', handleDonateClick)
    }

    if (shareBtn) {
      console.log('[HeroSection] Found share button, attaching listener')
      shareBtn.addEventListener('click', handleShareClick)
    }

    return () => {
      if (donateBtn) donateBtn.removeEventListener('click', handleDonateClick)
      if (shareBtn) shareBtn.removeEventListener('click', handleShareClick)
    }
  }, [])

  console.log('[HeroSection] Rendering with locale translations:', {
    donateNow: t('donateNow'),
    shareStory: t('shareStory'),
    isMounted,
  })

  const percentage = stats ? formatPercentage(stats.total_raised, stats.goal_amount) : 0

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50'>
      {/* Background decoration */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none' />

      <div className='container mx-auto px-4 py-12 md:py-20'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-center'>
            {/* Text Content */}
            <div className='space-y-6'>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight'>
                {t('headline')}
              </h1>

              <p className='text-lg md:text-xl text-gray-600'>{t('subheadline')}</p>

              {/* Progress Bar */}
              <div className='space-y-3'>
                <div className='flex justify-between text-sm text-gray-600'>
                  <span>
                    <strong className='text-2xl text-gray-900'>
                      {formatCurrency(stats?.total_raised || 0)}
                    </strong>{' '}
                    {t('raised')}
                  </span>
                  <span>
                    {t('of')}{' '}
                    <strong className='text-gray-900'>
                      {formatCurrency(stats?.goal_amount || 25000)}
                    </strong>{' '}
                    {t('goal')}
                  </span>
                </div>

                <div className='relative h-6 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className='absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out'
                    style={{ width: `${percentage}%` }}
                  >
                    <div className='absolute inset-0 bg-white/20 animate-pulse' />
                  </div>
                </div>

                <div className='flex items-center justify-between text-sm text-gray-600'>
                  <span>
                    <strong className='text-lg text-gray-900'>{stats?.donor_count || 0}</strong>{' '}
                    {t('supporters')}
                  </span>
                  <span className='font-semibold text-green-600'>{percentage}%</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <button
                  type='button'
                  data-button='donate'
                  onClick={handleDonateClick}
                  className='flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
                  aria-label={t('donateNow')}
                >
                  <Heart className='w-5 h-5' />
                  <span>{t('donateNow')}</span>
                </button>

                <button
                  type='button'
                  data-button='share'
                  onClick={handleShareClick}
                  className='flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 shadow hover:shadow-md transition-all duration-200 cursor-pointer'
                  aria-label={t('shareStory')}
                >
                  <Share2 className='w-5 h-5' />
                  <span>{t('shareStory')}</span>
                </button>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className='relative'>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                {/* Placeholder for José's photo */}
                <div className='aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                  <div className='text-center text-gray-500 p-8'>
                    <div className='w-32 h-32 mx-auto mb-4 rounded-full bg-gray-400' />
                    <p className='text-sm'>Photo of Dr. José</p>
                    <p className='text-xs mt-2'>Will be added</p>
                  </div>
                </div>

                {/* Credential Badge */}
                <div className='absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md'>
                  <p className='text-xs font-semibold text-gray-700'>50 Years of Service</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className='absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl pointer-events-none' />
              <div className='absolute -bottom-4 -left-4 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-2xl pointer-events-none' />
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </section>
  )
}
