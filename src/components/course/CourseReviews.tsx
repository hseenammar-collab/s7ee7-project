'use client'

import { Star, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import type { Review, Profile } from '@/types/database'

interface ReviewWithUser extends Review {
  user: Pick<Profile, 'full_name' | 'avatar_url'>
}

interface CourseReviewsProps {
  reviews: ReviewWithUser[]
  averageRating: number
  totalReviews: number
}

export default function CourseReviews({
  reviews,
  averageRating,
  totalReviews,
}: CourseReviewsProps) {
  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.round(r.rating) === rating).length,
    percentage:
      totalReviews > 0
        ? (reviews.filter((r) => Math.round(r.rating) === rating).length /
            totalReviews) *
          100
        : 0,
  }))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">لا توجد تقييمات بعد</h3>
        <p className="text-gray-500">كن أول من يقيم هذا الكورس</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-xl">
        {/* Average Rating */}
        <div className="text-center md:text-right">
          <div className="text-5xl font-bold text-primary mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-500">{totalReviews} تقييم</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{rating}</span>
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-gray-500 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-6 last:border-0"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={review.user?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {review.user?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">
                      {review.user?.full_name || 'مستخدم'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h5 className="font-medium mb-1">{review.title}</h5>
                )}
                {review.comment && (
                  <p className="text-gray-600">{review.comment}</p>
                )}

                {/* Admin Reply */}
                {review.admin_reply && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-1">
                      رد من الأكاديمية:
                    </p>
                    <p className="text-sm text-gray-600">{review.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
