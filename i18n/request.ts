import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'pt'] as const

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!locales.includes(locale as any)) {
    locale = 'en' // Default to English if invalid locale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})