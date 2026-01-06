// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: {
    default: 'S7ee7 Academy | أكاديمية صحيح',
    template: '%s | S7ee7 Academy'
  },
  description: 'منصة تعليمية عراقية لتعلم المهارات الرقمية والتسويق',
  keywords: ['كورسات', 'تعليم', 'تسويق رقمي', 'العراق', 'تعلم اونلاين'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${cairo.variable} font-cairo antialiased`}
        style={{ backgroundColor: '#0a0a0f', color: 'white' }}
      >
        <QueryProvider>
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-cairo)',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
