'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface WishlistItem {
  id: string
  user_id: string
  course_id: string
  created_at: string
  course?: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    price_iqd: number
    original_price_iqd: number | null
    instructor_name: string | null
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    setUserId(user.id)

    const { data } = await supabase
      .from('wishlist')
      .select(`
        *,
        course:courses(id, title, slug, thumbnail_url, price_iqd, original_price_iqd, instructor_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setWishlist(data as WishlistItem[])
      setWishlistIds(new Set(data.map((item) => item.course_id)))
    }

    setIsLoading(false)
  }

  const addToWishlist = useCallback(
    async (courseId: string) => {
      if (!userId) {
        toast.error('يجب تسجيل الدخول أولاً')
        return { success: false }
      }

      // Optimistic update
      setWishlistIds((prev) => new Set(prev).add(courseId))

      try {
        const { error } = await supabase.from('wishlist').insert({
          user_id: userId,
          course_id: courseId,
        })

        if (error) {
          // Revert on error
          setWishlistIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(courseId)
            return newSet
          })

          if (error.code === '23505') {
            // Already in wishlist
            return { success: true }
          }

          throw error
        }

        toast.success('تمت الإضافة للمفضلة')
        fetchWishlist() // Refresh to get full data

        return { success: true }
      } catch (error) {
        toast.error('حدث خطأ')
        return { success: false }
      }
    },
    [userId, supabase]
  )

  const removeFromWishlist = useCallback(
    async (courseId: string) => {
      if (!userId) {
        toast.error('يجب تسجيل الدخول أولاً')
        return { success: false }
      }

      // Optimistic update
      setWishlistIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
      setWishlist((prev) => prev.filter((item) => item.course_id !== courseId))

      try {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('course_id', courseId)

        if (error) {
          // Revert on error
          setWishlistIds((prev) => new Set(prev).add(courseId))
          fetchWishlist()
          throw error
        }

        toast.success('تمت الإزالة من المفضلة')

        return { success: true }
      } catch (error) {
        toast.error('حدث خطأ')
        return { success: false }
      }
    },
    [userId, supabase]
  )

  const toggleWishlist = useCallback(
    async (courseId: string) => {
      if (wishlistIds.has(courseId)) {
        return removeFromWishlist(courseId)
      } else {
        return addToWishlist(courseId)
      }
    },
    [wishlistIds, addToWishlist, removeFromWishlist]
  )

  const isInWishlist = useCallback(
    (courseId: string) => {
      return wishlistIds.has(courseId)
    },
    [wishlistIds]
  )

  const clearWishlist = useCallback(async () => {
    if (!userId) return { success: false }

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      setWishlist([])
      setWishlistIds(new Set())
      toast.success('تم مسح المفضلة')

      return { success: true }
    } catch (error) {
      toast.error('حدث خطأ')
      return { success: false }
    }
  }, [userId, supabase])

  return {
    wishlist,
    wishlistIds,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refreshWishlist: fetchWishlist,
    count: wishlist.length,
  }
}
