import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Button, Skeleton } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/hooks/useNotifications'
import { Calendar, FileText, MessageCircle, AtSign, Users, Info, Bell, X, Heart, Megaphone } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Notification } from '@/types'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

function formatNotificationTime(date: Date | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
}

function getNotificationIcon(type: Notification['type']): JSX.Element {
  switch (type) {
    case 'event_reminder':
    case 'event_update':
      return <Calendar size={18} />
    case 'new_post':
      return <FileText size={18} />
    case 'new_comment':
      return <MessageCircle size={18} />
    case 'mention':
      return <AtSign size={18} />
    case 'direct_message':
      return <MessageCircle size={18} />
    case 'group_invite':
      return <Users size={18} />
    case 'family_link':
      return <Heart size={18} />
    case 'announcement':
      return <Megaphone size={18} />
    default:
      return <Info size={18} />
  }
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: rawNotifications = [], isLoading } = useNotifications(user?.id || null, { limit: 20 })
  const muted = user?.mutedNotificationCategories || []
  const notifications = muted.length === 0
    ? rawNotifications
    : rawNotifications.filter((n) => !muted.includes(n.type))
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllRead.mutate(user.id)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-overlay flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-xl" tabIndex={-1}>
        <div className="flex items-center justify-between p-4 border-b border-cream-dark">
          <h3 className="text-lg font-semibold text-forest">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                Mark all read
              </Button>
            )}
            <button
              className="p-1 rounded-full hover:bg-cream transition-colors"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6 text-text-lighter">
              <Bell size={48} />
              <p>No notifications yet</p>
              <span className="text-sm text-text-lighter mt-2">
                You'll be notified about events, messages, and updates here
              </span>
            </div>
          ) : (
            <ul className="list-none m-0 p-0" role="list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    className={cn(
                      'flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-cream transition-colors border-b border-cream bg-transparent cursor-pointer',
                      !notification.read && 'bg-cream/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 text-forest mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary m-0">{notification.title}</p>
                      <p className="text-sm text-text-light m-0 mt-0.5">{notification.message}</p>
                      <span className="text-xs text-text-lighter mt-1 block">
                        {formatNotificationTime(notification.createdAt as Date)}
                      </span>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0 mt-2" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
