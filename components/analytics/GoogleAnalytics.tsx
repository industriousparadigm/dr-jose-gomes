'use client'

import Script from 'next/script'

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

// Event tracking helper
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track donation events
export const trackDonation = (amount: number, currency: string = 'USD') => {
  trackEvent('donation', 'engagement', currency, amount)
  
  // Also track as conversion
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      value: amount,
      currency: currency,
    })
  }
}

// Track share events
export const trackShare = (platform: string) => {
  trackEvent('share', 'social', platform)
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}