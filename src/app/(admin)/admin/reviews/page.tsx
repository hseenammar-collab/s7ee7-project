'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Eye, Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Review, Profile, Course } from '@/types/database'

interface ReviewWithDetails extends Review {
  user: Pick<Profile, 'full_name' | 'avatar_url'>
  course: Pick<Course, 'title'>
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [ratingFilter, statusFilter])

  const fetchReviews = async () => {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name, avatar_url),
        course:courses(title)
      `)
      .order('created_at', { ascending: false })

    if (ratingFilter && ratingFilter !== 'all') {
      query = query.eq('rating', parseInt(ratingFilter))
    }

    if (statusFilter === 'approved') {
      query = query.eq('is_approved', true)
    } else if (statusFilter === 'pending') {
      query = query.eq('is_approved', false)
    }

    const { data } = await query
    setReviews((data || []) as ReviewWithDetails[])
    setIsLoading(false)
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      review.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase())
  )

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) throw error

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_approved: true } : r
        )
      )
      toast.success('تم الموافقة على التقييم')
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const deleteReview = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setReviews((prev) => prev.filter((r) => r.id !== deleteId))
      toast.success('تم حذف التقييم')
    } catch (error) {
      toast.error('حدث خطأ في حذف التقييم')
    } finally {
      setDeleteId(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">إدارة التقييمات</h1>
        <p className="text-gray-500">{reviews.length} تقييم</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث بالاسم أو الكورس أو المحتوى..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التقييمات</SelectItem>
                <SelectItem value="5">5 نجوم</SelectItem>
                <SelectItem value="4">4 نجوم</SelectItem>
                <SelectItem value="3">3 نجوم</SelectItem>
                <SelectItem value="2">2 نجوم</SelectItem>
                <SelectItem value="1">1 نجمة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="pending">بانتظار الموافقة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد تقييمات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الكورس</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>التعليق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.user?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {review.user?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {review.user?.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {review.course?.title}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.comment || '-'}
                    </TableCell>
                    <TableCell>
                      {review.is_approved ? (
                        <Badge className="bg-green-100 text-green-700">
                          موافق عليه
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          بانتظار الموافقة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(review.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!review.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                            onClick={() => approveReview(review.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => setDeleteId(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل التقييم</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedReview.user?.avatar_url || ''} />
                  <AvatarFallback>
                    {selectedReview.user?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedReview.user?.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.course?.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {renderStars(selectedReview.rating)}
                <span className="text-gray-500">
                  ({selectedReview.rating}/5)
                </span>
              </div>

              {selectedReview.comment && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(selectedReview.created_at)}</span>
                {selectedReview.is_approved ? (
                  <Badge className="bg-green-100 text-green-700">
                    موافق عليه
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    بانتظار الموافقة
                  </Badge>
                )}
              </div>

              {!selectedReview.is_approved && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      approveReview(selectedReview.id)
                      setSelectedReview(null)
                    }}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 ml-2" />
                    الموافقة
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(selectedReview.id)
                      setSelectedReview(null)
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا التقييم نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteReview}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
