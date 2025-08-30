'use client'

import { useTranslations } from 'next-intl'
import { DonationForm } from '@/components/donation/DonationForm'

export function DonationSection() {
  const t = useTranslations('donation')

  return (
    <section id="donation" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('title')}
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <DonationForm />
          </div>
        </div>
      </div>
    </section>
  )
}