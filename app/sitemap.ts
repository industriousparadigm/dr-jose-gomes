import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://josegomes.fund'
  const locales = ['en', 'pt']
  
  const routes = [
    '',           // Home page
    '/thank-you', // Thank you page
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // Generate URLs for each locale and route combination
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : 0.5,
      })
    })
  })
  
  // Add admin routes (lower priority, no locale)
  sitemap.push({
    url: `${baseUrl}/admin/login`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.1,
  })
  
  return sitemap
}