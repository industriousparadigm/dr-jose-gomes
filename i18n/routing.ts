import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'pt'],
  defaultLocale: 'pt',  // Portuguese as default for PT locations
  localeDetection: true
})

export const { Link, redirect, usePathname, useRouter } = 
  createNavigation(routing)