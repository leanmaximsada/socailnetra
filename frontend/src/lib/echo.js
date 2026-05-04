import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const getToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth-storage'))
    return auth?.state?.token ?? null
  } catch {
    return null
  }
}

const createEcho = () => {
  const token = getToken()
  if (!token) return null

  try {
    return new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY ?? 'socialnetra-key',
      wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    })
  } catch (e) {
    console.warn('Echo failed to initialize:', e)
    return null
  }
}

export default createEcho()