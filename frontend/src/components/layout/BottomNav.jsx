import { NavLink } from 'react-router-dom'
import { Home, Search, Bell, User, Mail } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'
import echo from '../../lib/echo'
import { useNotificationPermission } from '../../hooks/useNotificationPermission'

export default function BottomNav() {
  const { isAuthenticated, user }               = useAuthStore()
  const [unread, setUnread]                     = useState(0)
  const prevUnreadRef                           = useRef(0)
  const { requestPermission, showNotification } = useNotificationPermission()

  useEffect(() => {
    if (!isAuthenticated) return

    requestPermission()

    const fetchCount = async (showBrowserNotif = false) => {
      try {
        const res = await api.get('/notifications/unread-count')
        const count = res.data.count ?? 0
        setUnread(count)

        // If count increased, fetch latest notification and show browser notif
        if (showBrowserNotif && count > prevUnreadRef.current) {
          try {
            const notifRes = await api.get('/notifications')
            const notifs = notifRes.data.data ?? notifRes.data
            const latest = notifs[0]
            if (latest) {
              const sender = latest.data?.sender?.name ?? 'Someone'
              const messages = {
                like:    `${sender} liked your post`,
                comment: `${sender} commented on your post`,
                follow:  `${sender} started following you`,
              }
              showNotification(
                'SocialNetra',
                messages[latest.data?.type] ?? 'You have a new notification',
                '/notifications'
              )
            }
          } catch {}
        }
        prevUnreadRef.current = count
      } catch {}
    }

    // Initial fetch
    fetchCount(false)

    // Poll every 10 seconds
    const interval = setInterval(() => fetchCount(true), 10000)

    // WebSocket listener
    if (echo && user?.id) {
      const channel = echo.private(`notifications.${user.id}`)
      channel.listen('.new.notification', (data) => {
        setUnread(prev => prev + 1)
        const sender = data.sender?.name ?? 'Someone'
        const messages = {
          like:    `${sender} liked your post`,
          comment: `${sender} commented on your post`,
          follow:  `${sender} started following you`,
        }
        showNotification(
          'SocialNetra',
          messages[data.type] ?? 'You have a new notification',
          '/notifications'
        )
      })
    }

    return () => {
      clearInterval(interval)
      if (echo && user?.id) echo.leave(`notifications.${user.id}`)
    }
  }, [isAuthenticated, user?.id])

  const tabs = [
    { to: '/feed',          icon: Home,  label: 'Home',     badge: 0 },
    { to: '/search',        icon: Search,label: 'Search',   badge: 0 },
    { to: '/notifications', icon: Bell,  label: 'Notif',    badge: unread },
    { to: '/messages',      icon: Mail,  label: 'Messages', badge: 0 },
    { to: '/profile',       icon: User,  label: 'Profile',  badge: 0 },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 border-t"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {tabs.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => { if (to === '/notifications') setUnread(0) }}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-3 px-3 gap-0.5 transition-all ${
              isActive ? 'text-[#3B9FE4]' : 'text-zinc-500 hover:text-zinc-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3B9FE4] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}