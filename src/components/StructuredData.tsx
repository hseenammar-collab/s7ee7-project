'use client'

interface CourseForSchema {
  title: string
  description: string
  price: number
  instructor?: string
  image?: string
  slug?: string
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'S7EE7 Academy',
    alternateName: 'أكاديمية صحيح',
    url: 'https://s7ee7.com',
    logo: 'https://s7ee7.com/logo.png',
    description: 'منصة تعليمية عربية للتسويق الرقمي والبرمجة والأمن السيبراني',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baghdad',
      addressCountry: 'IQ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      'https://facebook.com/s7ee7academy',
      'https://instagram.com/s7ee7academy',
      'https://twitter.com/s7ee7academy',
      'https://youtube.com/@s7ee7academy',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function CourseSchema({ course }: { course: CourseForSchema }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'S7EE7 Academy',
      sameAs: 'https://s7ee7.com',
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'IQD',
      availability: 'https://schema.org/InStock',
      url: `https://s7ee7.com/courses/${course.slug}`,
    },
    image: course.image,
    instructor: course.instructor ? {
      '@type': 'Person',
      name: course.instructor,
    } : undefined,
    inLanguage: 'ar',
    isAccessibleForFree: false,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'S7EE7 Academy',
    alternateName: 'أكاديمية صحيح',
    url: 'https://s7ee7.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://s7ee7.com/courses?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'ar',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
