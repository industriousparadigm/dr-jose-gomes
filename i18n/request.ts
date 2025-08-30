import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'pt'] as const

export default getRequestConfig(async ({ locale }) => {
  // Validate locale - ensure it's not undefined
  const validatedLocale = locale && locales.includes(locale as any) ? locale : 'en'

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default,
  }
})
