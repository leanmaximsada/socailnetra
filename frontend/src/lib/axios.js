import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Add auth token to every request
api.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth-storage'))
    const token = auth?.state?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})

// Helper to fix image URLs for production
export const storageUrl = (path) => {
  if (!path) return null
  const baseUrl = (import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://127.0.0.1:8000')
  if (path.startsWith('http')) {
    // Replace local URL and force https in production
    let url = path.replace('http://127.0.0.1:8000', baseUrl)
    if (baseUrl.startsWith('https://')) {
      url = url.replace('http://', 'https://')
    }
    return url
  }
  return `${baseUrl}/storage/${path}`
}

export default api