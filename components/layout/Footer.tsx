'use client'

import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <p className="text-lg font-semibold">{t('organized')}</p>
          </div>
          
          <p className="text-gray-400 mb-8">
            {t('disclaimer')}
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm">
            <a href="#" className="hover:text-blue-400 transition-colors">
              {t('contact')}
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              {t('privacy')}
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500">
            <p>© 2024 Help Dr. José Gomes. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}