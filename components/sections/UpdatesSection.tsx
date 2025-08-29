'use client'

import { useTranslations } from 'next-intl'
import { Calendar, User } from 'lucide-react'
import { Update } from '@/types'
import { format } from 'date-fns'
import { useLocale } from 'next-intl'

interface UpdatesSectionProps {
  updates: Update[]
}

export function UpdatesSection({ updates }: UpdatesSectionProps) {
  const t = useTranslations('updates')
  const locale = useLocale()
  
  return (
    <section id="updates" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('title')}
          </h2>
          
          {updates.length === 0 ? (
            <div className="text-center py-12 px-6 bg-gray-50 rounded-xl">
              <p className="text-gray-600">{t('noUpdates')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <article 
                  key={update.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  {update.is_pinned && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
                      Pinned
                    </span>
                  )}
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {locale === 'pt' ? update.title_pt : update.title_en}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(update.created_at), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {t('postedBy')} {update.author}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="line-clamp-3">
                      {locale === 'pt' ? update.content_pt : update.content_en}
                    </p>
                  </div>
                  
                  <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    {t('readMore')} →
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}