'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Clock,
  BookOpen,
  PlayCircle,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/constants'

interface SearchResult {
  id: string
  type: 'course' | 'lesson'
  title: string
  description?: string
  thumbnail?: string
  slug?: string
  course_slug?: string
  price?: number
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const RECENT_SEARCHES_KEY = 's7ee7_recent_searches'
const MAX_RECENT_SEARCHES = 5

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Search function with debounce
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)

      try {
        // Search courses
        const { data: courses } = await supabase
          .from('courses')
          .select('id, title, description, thumbnail_url, slug, price_iqd')
          .eq('is_published', true)
          .ilike('title', `%${searchQuery}%`)
          .limit(5)

        // Search lessons
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, title, courses(slug)')
          .ilike('title', `%${searchQuery}%`)
          .limit(5)

        const searchResults: SearchResult[] = [
          ...(courses?.map((c) => ({
            id: c.id,
            type: 'course' as const,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail_url,
            slug: c.slug,
            price: c.price_iqd,
          })) || []),
          ...(lessons?.map((l: any) => ({
            id: l.id,
            type: 'lesson' as const,
            title: l.title,
            course_slug: l.courses?.slug,
          })) || []),
        ]

        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Save to recent searches
  const saveToRecent = (searchQuery: string) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    saveToRecent(query)
    onClose()

    if (result.type === 'course') {
      router.push(`/courses/${result.slug}`)
    } else if (result.type === 'lesson' && result.course_slug) {
      router.push(`/courses/${result.course_slug}`)
    }
  }

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search)
    performSearch(search)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = results.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleResultClick(results[activeIndex])
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن كورسات أو دروس..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-lg"
              dir="rtl"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400">
              ESC
            </kbd>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full" />
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs text-gray-500 font-medium">
                  نتائج البحث
                </div>
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-right ${
                      activeIndex === index
                        ? 'bg-cyan-500/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Thumbnail or Icon */}
                    {result.type === 'course' && result.thumbnail ? (
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={result.thumbnail}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          result.type === 'course'
                            ? 'bg-cyan-500/20'
                            : 'bg-purple-500/20'
                        }`}
                      >
                        {result.type === 'course' ? (
                          <BookOpen className="h-5 w-5 text-cyan-400" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.type === 'course' ? 'كورس' : 'درس'}
                        {result.type === 'course' &&
                          result.price !== undefined && (
                            <span className="mr-2 text-cyan-400">
                              {result.price === 0
                                ? 'مجاني'
                                : `${formatPrice(result.price)} د.ع`}
                            </span>
                          )}
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg
                      className="h-4 w-4 text-gray-500 flex-shrink-0 rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
              <div className="py-12 text-center">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد نتائج لـ "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  جرب كلمات بحث مختلفة
                </p>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-gray-500 font-medium">
                    عمليات البحث الأخيرة
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentClick(search)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-right"
                  >
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-300">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!query && recentSearches.length === 0 && (
              <div className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">ابدأ البحث عن كورسات ودروس</p>
                <p className="text-sm text-gray-500 mt-1">
                  اكتب اسم الكورس أو الدرس الذي تبحث عنه
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
                للتنقل
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd>
                للاختيار
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">K</kbd> للبحث
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook to use search modal
export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }
}
