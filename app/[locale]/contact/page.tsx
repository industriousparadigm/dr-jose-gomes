'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Mail, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function ContactPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('contact')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header locale={locale} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t('title')}
            </h1>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <p className="text-gray-600 mb-8">
                {t('description')}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('email')}
                    </h3>
                    <a href="mailto:family@josegomes.fund" className="text-blue-600 hover:underline">
                      family@josegomes.fund
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('message')}
                    </h3>
                    <p className="text-gray-600">
                      {t('messageDescription')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {t('campaignInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}