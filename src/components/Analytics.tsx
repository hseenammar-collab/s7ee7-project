'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

// Google Analytics
function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()

    // @ts-ignore
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  )
}

// Facebook Pixel
function FacebookPixelInner() {
  const pathname = usePathname()

  useEffect(() => {
    if (!FB_PIXEL_ID) return

    // @ts-ignore
    window.fbq?.('track', 'PageView')
  }, [pathname])

  if (!FB_PIXEL_ID) return null

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

export function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelInner />
    </Suspense>
  )
}

// Analytics tracking functions
export const analytics = {
  // Track page view
  pageView: (url: string) => {
    // @ts-ignore
    window.gtag?.('config', GA_MEASUREMENT_ID, { page_path: url })
    // @ts-ignore
    window.fbq?.('track', 'PageView')
  },

  // Track course view
  viewCourse: (courseId: string, courseName: string, price: number) => {
    // @ts-ignore
    window.gtag?.('event', 'view_item', {
      currency: 'IQD',
      value: price,
      items: [{ item_id: courseId, item_name: courseName }],
    })
    // @ts-ignore
    window.fbq?.('track', 'ViewContent', {
      content_ids: [courseId],
      content_name: courseName,
      content_type: 'product',
      value: price,
      currency: 'IQD',
    })
  },

  // Track add to cart
  addToCart: (courseId: string, courseName: string, price: number) => {
    // @ts-ignore
    window.gtag?.('event', 'add_to_cart', {
      currency: 'IQD',
      value: price,
      items: [{ item_id: courseId, item_name: courseName }],
    })
    // @ts-ignore
    window.fbq?.('track', 'AddToCart', {
      content_ids: [courseId],
      content_name: courseName,
      value: price,
      currency: 'IQD',
    })
  },

  // Track purchase
  purchase: (
    orderId: string,
    courseId: string,
    courseName: string,
    price: number
  ) => {
    // @ts-ignore
    window.gtag?.('event', 'purchase', {
      transaction_id: orderId,
      currency: 'IQD',
      value: price,
      items: [{ item_id: courseId, item_name: courseName }],
    })
    // @ts-ignore
    window.fbq?.('track', 'Purchase', {
      content_ids: [courseId],
      content_name: courseName,
      value: price,
      currency: 'IQD',
    })
  },

  // Track signup
  signUp: (method: string) => {
    // @ts-ignore
    window.gtag?.('event', 'sign_up', { method })
    // @ts-ignore
    window.fbq?.('track', 'CompleteRegistration')
  },

  // Track search
  search: (searchTerm: string) => {
    // @ts-ignore
    window.gtag?.('event', 'search', { search_term: searchTerm })
    // @ts-ignore
    window.fbq?.('track', 'Search', { search_string: searchTerm })
  },

  // Track begin checkout
  beginCheckout: (courseId: string, courseName: string, price: number) => {
    // @ts-ignore
    window.gtag?.('event', 'begin_checkout', {
      currency: 'IQD',
      value: price,
      items: [{ item_id: courseId, item_name: courseName }],
    })
    // @ts-ignore
    window.fbq?.('track', 'InitiateCheckout', {
      content_ids: [courseId],
      content_name: courseName,
      value: price,
      currency: 'IQD',
    })
  },
}

// Combined Analytics Component
export default function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <FacebookPixel />
    </>
  )
}
