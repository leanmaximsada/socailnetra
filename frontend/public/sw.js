self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'SocialNetra'
  const options = {
    body: data.body ?? 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: data.url ?? '/',
    vibrate: [100, 50, 100],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data ?? '/')
  )
})