export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FundingAgency',
    name: 'Dr. José Gomes Medical Recovery Fund',
    description: 'Support Dr. José Gomes de Oliveira, a 74-year-old urologist, in his recovery from stroke.',
    url: 'https://josegomes.fund',
    potentialAction: {
      '@type': 'DonateAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://josegomes.fund#donation',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      recipient: {
        '@type': 'Person',
        name: 'Dr. José Gomes de Oliveira',
        jobTitle: 'Urologist',
        description: '74-year-old medical professional recovering from stroke'
      }
    },
    founder: {
      '@type': 'Organization',
      name: 'The Gomes Family'
    },
    datePublished: '2024-01-01',
    inLanguage: ['en', 'pt'],
    isAccessibleForFree: true,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '100',
      bestRating: '5',
      worstRating: '1'
    }
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://josegomes.fund'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Donate',
        item: 'https://josegomes.fund#donation'
      }
    ]
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is Dr. José Gomes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. José Gomes de Oliveira is a 74-year-old urologist who dedicated 50 years to medicine, with advanced training in Germany and the USA.'
        }
      },
      {
        '@type': 'Question',
        name: 'Why does Dr. José need help?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. José recently suffered a stroke and requires specialized treatment and intensive care for his recovery.'
        }
      },
      {
        '@type': 'Question',
        name: 'How will donations be used?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All donations go directly to Dr. José\'s medical treatment, rehabilitation, and care expenses.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are donations tax-deductible?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, donations are personal gifts to support medical treatment and are not tax-deductible charitable contributions.'
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  )
}