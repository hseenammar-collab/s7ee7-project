// src/components/LazyLoad.tsx
'use client'

import { useEffect, useState, useRef, ReactNode, Suspense } from 'react'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

// Default loading skeleton
const DefaultFallback = () => (
  <div className="animate-pulse bg-white/5 rounded-2xl min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
)

export default function LazyLoad({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      setHasLoaded(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Keep it loaded once visible
          setTimeout(() => setHasLoaded(true), 100)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

// Higher-order component for lazy loading
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<LazyLoadProps, 'children'>
) {
  return function LazyComponent(props: P) {
    return (
      <LazyLoad {...options}>
        <Component {...props} />
      </LazyLoad>
    )
  }
}