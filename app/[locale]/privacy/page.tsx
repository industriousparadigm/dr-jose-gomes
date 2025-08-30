'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Shield, Lock, Eye, UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function PrivacyPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('privacy')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header locale={locale} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t('title')}
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('subtitle')}
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t('informationWeCollect')}
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>{t('collectItems.name')}</li>
                      <li>{t('collectItems.email')}</li>
                      <li>{t('collectItems.donationAmount')}</li>
                      <li>{t('collectItems.message')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t('howWeUse')}
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>{t('useItems.process')}</li>
                      <li>{t('useItems.confirmation')}</li>
                      <li>{t('useItems.publicMessages')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t('yourRights')}
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>{t('rightsItems.anonymous')}</li>
                      <li>{t('rightsItems.notSold')}</li>
                      <li>{t('rightsItems.removal')}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>{t('securePayments')}</strong>{' '}
                    {t('securePaymentsText')}
                  </p>
                </div>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>
                    {t('lastUpdated')} {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}