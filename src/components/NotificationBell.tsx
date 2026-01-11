'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  BookOpen,
  CreditCard,
  Award,
  MessageSquare,
  Star,
  Gift,
  Megaphone,
  Settings,
  CheckCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  enrollment: <BookOpen className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  certificate: <Award className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  review: <Star className="h-4 w-4" />,
  coupon: <Gift className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
}

const notificationColors: Record<string, string> = {
  enrollment: 'bg-cyan-500/20 text-cyan-400',
  payment: 'bg-green-500/20 text-green-400',
  certificate: 'bg-yellow-500/20 text-yellow-400',
  comment: 'bg-blue-500/20 text-blue-400',
  review: 'bg-purple-500/20 text-purple-400',
  coupon: 'bg-pink-500/20 text-pink-400',
  announcement: 'bg-orange-500/20 text-orange-400',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    setupRealtimeSubscription()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    }

    setIsLoading(false)
  }

  const setupRealtimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Play notification sound (optional)
          // new Audio('/notification.mp3').play()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId)

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold text-white">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="h-4 w-4 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`relative group ${
                        !notification.is_read ? 'bg-white/5' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full p-4 text-right hover:bg-white/5 transition-colors"
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notificationColors[notification.type] ||
                              'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {notificationIcons[notification.type] || (
                              <Bell className="h-4 w-4" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                {
                                  addSuffix: true,
                                  locale: ar,
                                }
                              )}
                            </p>
                          </div>

                          {/* Unread Indicator */}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                      >
                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => {
                    router.push('/dashboard/notifications')
                    setIsOpen(false)
                  }}
                  className="w-full py-2 text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  عرض كل الإشعارات
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to create notifications
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  const supabase = createClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    link: link || null,
  })

  return { error }
}
