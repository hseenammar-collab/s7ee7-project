'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a1a" offset="20%" />
      <stop stop-color="#2a2a2a" offset="50%" />
      <stop stop-color="#1a1a1a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1a1a1a" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  fill = false,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const defaultBlur = `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`

  if (error || !src) {
    return (
      <div
        className={cn(
          'bg-gray-800 flex items-center justify-center',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-gray-500 text-sm">لا توجد صورة</span>
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden', fill && 'relative w-full h-full')}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlur}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-lg' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        sizes={
          fill
            ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            : undefined
        }
      />
    </div>
  )
}
