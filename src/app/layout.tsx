// src/app/layout.tsx
import type { Metadata } from 'next'
import { Noto_Kufi_Arabic } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import Analytics from '@/components/Analytics'
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData'
import WhatsAppButton from '@/components/WhatsAppButton'

const notoKufi = Noto_Kufi_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-kufi',
  display: 'swap', // Critical: prevents font blocking
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: {
    default: 'S7EE7 Academy - منصة التعلم الرقمي العربية',
    template: '%s | S7EE7 Academy'
  },
  description: 'تعلم التسويق الرقمي، البرمجة، الأمن السيبراني والمزيد. 41 كورس في 7 تخصصات مع شهادات معتمدة.',
  keywords: ['كورسات عربية', 'تسويق رقمي', 'برمجة', 'تعلم اونلاين', 'أمن سيبراني', 'العراق'],
  authors: [{ name: 'S7EE7 Academy' }],
  creator: 'S7EE7 Academy',
  publisher: 'S7EE7 Academy',
  metadataBase: new URL('https://s7ee7.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    url: 'https://s7ee7.com',
    siteName: 'S7EE7 Academy',
    title: 'S7EE7 Academy - منصة التعلم الرقمي العربية',
    description: 'تعلم التسويق الرقمي والبرمجة بالعربي. 41 كورس مع شهادات معتمدة.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'S7EE7 Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S7EE7 Academy - منصة التعلم الرقمي العربية',
    description: 'تعلم التسويق الرقمي والبرمجة بالعربي',
    images: ['/og-image.png'],
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body
        className={`${notoKufi.variable} font-sans antialiased`}
        style={{ backgroundColor: '#0a0a0f', color: 'white' }}
      >
        <QueryProvider>
          <AuthProvider>
            <Analytics />
            {children}
            <WhatsAppButton phoneNumber="9647818812713" />
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-noto-kufi)',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}