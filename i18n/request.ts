import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'pt'] as const

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})