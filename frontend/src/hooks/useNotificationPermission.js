import { useState, useEffect } from 'react'

export function useNotificationPermission() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const showNotification = (title, body, url = '/') => {
    if (permission !== 'granted') return
    if (document.visibilityState === 'visible') return // Don't show if tab is active

    try {
      const notif = new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        data: url,
      })
      notif.onclick = () => {
        window.focus()
        notif.close()
      }
    } catch {}
  }

  return { permission, requestPermission, showNotification }
}