// src/components/home/LazyComponents.tsx
'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading skeleton for sections
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-400 text-sm">جاري التحميل...</p>
    </div>
  </div>
)

// Lazy load heavy components
export const LazyTestimonials = dynamic(
  () => import('./Testimonials'),
  {
    loading: () => <SectionLoader />,
    ssr: false, // Disable SSR for animation-heavy components
  }
)

export const LazyReviewSection = dynamic(
  () => import('../ReviewSection'),
  {
    loading: () => <SectionLoader />,
    ssr: false,
  }
)

export const LazySearchModal = dynamic(
  () => import('../SearchModal'),
  {
    loading: () => null,
    ssr: false,
  }
)

export const LazyNotificationBell = dynamic(
  () => import('../NotificationBell'),
  {
    loading: () => (
      <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
    ),
    ssr: false,
  }
)