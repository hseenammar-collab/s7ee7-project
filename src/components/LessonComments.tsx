'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Reply,
  MoreVertical,
  Trash2,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
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

interface Comment {
  id: string
  user_id: string
  lesson_id: string
  content: string
  parent_id: string | null
  likes_count: number
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
  replies?: Comment[]
}

interface LessonCommentsProps {
  lessonId: string
  isEnrolled?: boolean
}

export default function LessonComments({
  lessonId,
  isEnrolled = false,
}: LessonCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchComments()
    getCurrentUser()
  }, [lessonId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }

  const fetchComments = async () => {
    setIsLoading(true)

    // Fetch top-level comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, role)
      `)
      .eq('lesson_id', lessonId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (commentsData) {
      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              user:profiles(id, full_name, avatar_url, role)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || [],
          }
        })
      )

      setComments(commentsWithReplies as Comment[])
    }

    setIsLoading(false)
  }

  const submitComment = async () => {
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
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        lesson_id: lessonId,
        content: newComment,
      })

      if (error) throw error

      toast.success('تم إضافة التعليق')
      setNewComment('')
      fetchComments()
    } catch (error) {
      toast.error('حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('يرجى كتابة رد')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        lesson_id: lessonId,
        content: replyContent,
        parent_id: parentId,
      })

      if (error) throw error

      toast.success('تم إضافة الرد')
      setReplyContent('')
      setReplyingTo(null)
      setExpandedReplies((prev) => new Set(prev).add(parentId))
      fetchComments()
    } catch (error) {
      toast.error('حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      toast.success('تم حذف التعليق')
      fetchComments()
    } catch (error) {
      toast.error('حدث خطأ في الحذف')
    }
  }

  const toggleLike = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('يجب تسجيل الدخول')
      return
    }

    const comment = comments.find((c) => c.id === commentId) ||
      comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId)

    if (comment) {
      await supabase
        .from('comments')
        .update({ likes_count: (comment.likes_count || 0) + 1 })
        .eq('id', commentId)

      // Update local state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, likes_count: (c.likes_count || 0) + 1 }
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, likes_count: (r.likes_count || 0) + 1 }
                  : r
              ),
            }
          }
          return c
        })
      )
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
          أدمن
        </span>
      )
    }
    if (role === 'instructor') {
      return (
        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
          مدرب
        </span>
      )
    }
    return null
  }

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment
    isReply?: boolean
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'mr-12 mt-3' : ''}`}
    >
      <div className="flex gap-3">
        <Avatar className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'} border border-white/10 flex-shrink-0`}>
          <AvatarImage src={comment.user?.avatar_url || ''} />
          <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm">
            {comment.user?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white">
              {comment.user?.full_name || 'مستخدم'}
            </span>
            {getRoleBadge(comment.user?.role)}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
          </div>

          <p className="mt-1 text-gray-300 text-sm leading-relaxed break-words">
            {comment.content}
          </p>

          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => toggleLike(comment.id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>{comment.likes_count || 0}</span>
            </button>

            {!isReply && isEnrolled && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  setReplyContent('')
                }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>رد</span>
              </button>
            )}

            {currentUserId === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900 border-white/10"
                >
                  <DropdownMenuItem
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="اكتب ردك..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm min-h-[60px]"
                    dir="rtl"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => submitReply(comment.id)}
                    disabled={isSubmitting}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs"
                  >
                    {isSubmitting ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'إرسال'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    إلغاء
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {expandedReplies.has(comment.id) ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    إخفاء الردود ({comment.replies.length})
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    عرض الردود ({comment.replies.length})
                  </>
                )}
              </button>

              <AnimatePresence>
                {expandedReplies.has(comment.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mt-3"
                  >
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} isReply />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
          التعليقات ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {isEnrolled ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك أو سؤالك..."
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
            dir="rtl"
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={submitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">سجل في الكورس لإضافة تعليقات</p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">لا توجد تعليقات بعد</p>
          <p className="text-sm text-gray-500 mt-1">
            كن أول من يعلق على هذا الدرس
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
            >
              <CommentItem comment={comment} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
