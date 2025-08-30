'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('header')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo/Title */}
          <Link
            href={`/${locale}`}
            className='flex items-center gap-2 hover:opacity-80 transition-opacity'
          >
            <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full' />
            <span className='font-bold text-lg text-gray-900'>Dr. José Gomes Fund</span>
          </Link>

          {/* Navigation Items */}
          <nav className='hidden md:flex items-center gap-6'>
            <Link
              href={`/${locale}#story`}
              className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
            >
              {t('story')}
            </Link>
            <Link
              href={`/${locale}#donation`}
              className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
            >
              {t('donate')}
            </Link>
            <Link
              href={`/${locale}#updates`}
              className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
            >
              {t('updates')}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className='flex items-center gap-4'>
            <LanguageSwitcher currentLocale={locale} />

            <button
              onClick={() => {
                // If we're not on the homepage, navigate there first
                if (window.location.pathname !== `/${locale}`) {
                  window.location.href = `/${locale}#donation`
                } else {
                  document.getElementById('donation')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className='hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
            >
              {t('contribute')}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
            >
              {isMobileMenuOpen ? (
                <X className='w-6 h-6 text-gray-600' />
              ) : (
                <Menu className='w-6 h-6 text-gray-600' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden bg-white border-t border-gray-100'>
            <nav className='container mx-auto px-4 py-4 space-y-4'>
              <Link
                href={`/${locale}#story`}
                className='block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('story')}
              </Link>
              <Link
                href={`/${locale}#donation`}
                className='block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('donate')}
              </Link>
              <Link
                href={`/${locale}#updates`}
                className='block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('updates')}
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  // If we're not on the homepage, navigate there first
                  if (window.location.pathname !== `/${locale}`) {
                    window.location.href = `/${locale}#donation`
                  } else {
                    document.getElementById('donation')?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer'
              >
                {t('contribute')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
