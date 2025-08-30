'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full" />
            <span className="font-bold text-lg text-gray-900">
              Dr. José Gomes Fund
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#story" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'pt' ? 'História' : 'Story'}
            </a>
            <a 
              href="#donation" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'pt' ? 'Doar' : 'Donate'}
            </a>
            <a 
              href="#updates" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'pt' ? 'Atualizações' : 'Updates'}
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            
            <button
              onClick={() => document.getElementById('donation')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {locale === 'pt' ? 'Contribuir' : 'Contribute'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}