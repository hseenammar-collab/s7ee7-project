import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  keywords?: string[]
}

export function generateSEO({
  title,
  description,
  image = '/og-image.jpg',
  url = 'https://s7ee7.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
}: SEOProps): Metadata {
  const siteName = 'S7EE7 Academy'
  const fullTitle = `${title} | ${siteName}`

  return {
    title: fullTitle,
    description,
    keywords: [
      'كورسات',
      'تعليم',
      'برمجة',
      'أمن سيبراني',
      'شبكات',
      'تسويق رقمي',
      'عراق',
      ...keywords,
    ],
    authors: author ? [{ name: author }] : [{ name: 'S7EE7 Academy' }],
    creator: 'S7EE7 Academy',
    publisher: 'S7EE7 Academy',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'ar_IQ',
      url,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@s7ee7academy',
    },
    alternates: {
      canonical: url,
      languages: {
        'ar-IQ': url,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    },
  }
}
