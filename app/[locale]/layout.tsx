import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Help Dr. José Gomes - Medical Recovery Fund',
  description: 'Support Dr. José Gomes de Oliveira, a 74-year-old urologist, in his recovery from stroke. After 50 years of healing others, he needs our help.',
  keywords: 'Dr José Gomes, medical fundraising, stroke recovery, crowdfunding',
  openGraph: {
    title: 'Help Dr. José Gomes Recover',
    description: 'After 50 years healing others, Dr. José needs our help',
    type: 'website',
    images: ['/jose-hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Dr. José Gomes Recover',
    description: 'After 50 years healing others, Dr. José needs our help',
  },
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const locales = ['en', 'pt']
  if (!locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
