'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'

export function StorySection() {
  const t = useTranslations('story')
  
  return (
    <section id="story" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('title')}
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {t('content')}
            </div>
          </div>
          
          {/* Medical Credentials */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('credentials')}
            </h3>
            
            <div className="space-y-3">
              {(t.raw('credentialsList') as string[]).map((credential, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{credential}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Family Photos Placeholder */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Family Photo {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}