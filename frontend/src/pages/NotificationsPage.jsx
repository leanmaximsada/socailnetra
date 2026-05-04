import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import {
  Heart, UserPlus, MessageCircle, Loader2,
  BellOff, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import AppLayout from '../components/layout/AppLayout'
import api from '../lib/axios'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function notifIcon(type) {
  switch (type) {
    case 'like':    return <Heart size={16} className="text-pink-500" fill="currentColor" />
    case 'follow':  return <UserPlus size={16} className="text-[#3B9FE4]" />
    case 'comment': return <MessageCircle size={16} className="text-green-400" />
    default:        return <Bell size={16} className="text-zinc-400" />
  }
}

function notifMessage(notif) {
  const name = notif.data?.sender?.name ?? 'Someone'
  switch (notif.data?.type) {
    case 'like':    return <><strong className="text-white">{name}</strong> <span className="text-zinc-400">liked your post</span></>
    case 'follow':  return <><strong className="text-white">{name}</strong> <span className="text-zinc-400">started following you</span></>
    case 'comment': return <><strong className="text-white">{name}</strong> <span className="text-zinc-400">commented on your post</span></>
    default:        return <><strong className="text-white">{name}</strong> <span className="text-zinc-400">interacted with you</span></>
  }
}

function Avatar({ name, username }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [markingAll, setMarkingAll]       = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data ?? res.data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      toast.success('All marked as read')
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setMarkingAll(false)
    }
  }

 const markRead = async (notif) => {
  if (!notif.read_at) {
    try {
      await api.post(`/notifications/${notif.id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch {}
  }
  if (notif.data?.type === 'follow' && notif.data?.sender?.username) {
    navigate(`/profile/${notif.data.sender.username}`)
  } else if (notif.data?.post_id) {
    navigate(`/posts/${notif.data.post_id}`)
  }
}

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <AppLayout title="Notifications">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
        <h1 className="text-white font-bold text-lg">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-[#3B9FE4] text-sm font-semibold hover:opacity-70 transition disabled:opacity-40"
          >
            {markingAll
              ? <Loader2 size={14} className="animate-spin" />
              : <Check size={14} />
            }
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
{loading ? (
  <div>
    {[1,2,3,4,5].map(i => <NotificationSkeleton key={i} />)}
  </div>
      ) : notifications.length === 0 ? (
        <EmptyState
  icon="🔔"
  title="No notifications yet"
  subtitle="When someone likes or follows you, it'll show here"
/>
      ) : (
        <div>
{notifications.map((notif) => (
  <div
    key={notif.id}
    onClick={() => markRead(notif)}
    className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-900 cursor-pointer transition-colors hover:bg-zinc-950 ${
      !notif.read_at ? 'bg-zinc-900/40' : ''
    }`}
  >
    {/* Unread dot */}
    <div className="flex flex-col items-center pt-1">
      {!notif.read_at && (
        <div className="w-2 h-2 rounded-full bg-[#3B9FE4] mb-1" />
      )}
    </div>

    {/* Avatar + icon */}
    <div className="relative shrink-0">
      <Avatar name={notif.data?.sender?.name} username={notif.data?.sender?.username} />
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800">
        {notifIcon(notif.data?.type)}
      </div>
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0 pt-1">
      <p className="text-sm leading-snug">
        {notifMessage(notif)}
      </p>
      {notif.data?.comment?.body && (
        <p className="text-zinc-500 text-xs mt-1 truncate">"{notif.data.comment.body}"</p>
      )}
      <p className="text-zinc-600 text-xs mt-1">{timeAgo(notif.created_at)}</p>
    </div>

    {/* Post preview */}
    {notif.data?.post?.caption && (
      <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden">
        <p className="text-zinc-500 text-[9px] text-center px-1 line-clamp-3">{notif.data.post.caption}</p>
      </div>
    )}
  </div>
))}
        </div>
      )}
    </AppLayout>
  )
}