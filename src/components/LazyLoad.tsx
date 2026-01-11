'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface LazyLoadProps {
  children: ReactNode
  placeholder?: ReactNode
  threshold?: number
  rootMargin?: string
}

export default function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder || <LoadingPlaceholder />}
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="animate-pulse bg-white/5 rounded-xl h-64 w-full" />
  )
}
