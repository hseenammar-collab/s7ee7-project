'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, User, MoreVertical, Trash2, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Review {
  id: string
  user_id: string
  course_id: string
  rating: number
  comment: string
  helpful_count: number
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

interface ReviewSectionProps {
  courseId: string
  isEnrolled?: boolean
}

export default function ReviewSection({
  courseId,
  isEnrolled = false,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
    getCurrentUser()
  }, [courseId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }

  const fetchReviews = async () => {
    setIsLoading(true)

    // Fetch reviews with user info
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (reviewsData) {
      setReviews(reviewsData as Review[])
      setTotalReviews(reviewsData.length)

      // Calculate average
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        setAverageRating(Math.round(avg * 10) / 10)

        // Calculate distribution
        const dist = [0, 0, 0, 0, 0]
        reviewsData.forEach((r) => {
          dist[r.rating - 1]++
        })
        setRatingDistribution(dist)
      }

      // Check if current user has a review
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userRev = reviewsData.find((r) => r.user_id === user.id)
        setUserReview(userRev as Review | undefined || null)
      }
    }

    setIsLoading(false)
  }

  const submitReview = async () => {
    if (!newComment.trim()) {
      toast.error('يرجى كتابة تعليق')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }

    setIsSubmitting(true)

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: newRating,
            comment: newComment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userReview.id)

        if (error) throw error
        toast.success('تم تحديث التقييم')
      } else {
        // Create new review
        const { error } = await supabase.from('reviews').insert({
          user_id: user.id,
          course_id: courseId,
          rating: newRating,
          comment: newComment,
        })

        if (error) throw error
        toast.success('تم إضافة التقييم')
      }

      setShowForm(false)
      setNewComment('')
      setNewRating(5)
      fetchReviews()
    } catch (error) {
      toast.error('حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      toast.success('تم حذف التقييم')
      fetchReviews()
    } catch (error) {
      toast.error('حدث خطأ في الحذف')
    }
  }

  const markHelpful = async (reviewId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('يجب تسجيل الدخول')
      return
    }

    // Increment helpful count
    const review = reviews.find((r) => r.id === reviewId)
    if (review) {
      await supabase
        .from('reviews')
        .update({ helpful_count: (review.helpful_count || 0) + 1 })
        .eq('id', reviewId)

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
            : r
        )
      )
    }
  }

  const renderStars = (rating: number, interactive = false, size = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setNewRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${sizeClass} ${
                star <= (interactive ? hoveredRating || newRating : rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {averageRating || '-'}
            </div>
            {renderStars(Math.round(averageRating), false, 'lg')}
            <p className="text-gray-400 mt-2">{totalReviews} تقييم</p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star - 1]
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-400">{star}</span>
                  </div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-yellow-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Review Button */}
        {isEnrolled && !showForm && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              onClick={() => {
                if (userReview) {
                  setNewRating(userReview.rating)
                  setNewComment(userReview.comment)
                }
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
            >
              <Star className="h-4 w-4 ml-2" />
              {userReview ? 'تعديل تقييمك' : 'أضف تقييم'}
            </Button>
          </div>
        )}

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    تقييمك
                  </label>
                  {renderStars(newRating, true, 'lg')}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    تعليقك
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="شاركنا رأيك في الكورس..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={submitReview}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : userReview ? (
                      'تحديث التقييم'
                    ) : (
                      'نشر التقييم'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setNewComment('')
                      setNewRating(5)
                    }}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">التقييمات</h3>

        {reviews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد تقييمات بعد</p>
            <p className="text-sm text-gray-500 mt-1">
              كن أول من يقيم هذا الكورس
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={review.user?.avatar_url || ''} />
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                        {review.user?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {review.user?.full_name || 'مستخدم'}
                      </p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, false, 'sm')}
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentUserId === review.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-white/10"
                      >
                        <DropdownMenuItem
                          onClick={() => deleteReview(review.id)}
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <p className="mt-4 text-gray-300 leading-relaxed">
                  {review.comment}
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => markHelpful(review.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>مفيد ({review.helpful_count || 0})</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
