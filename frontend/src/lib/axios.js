export const storageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) {
    // Replace local URL with production URL in production
    return path.replace(
      'http://127.0.0.1:8000',
      import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://127.0.0.1:8000'
    )
  }
  return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://127.0.0.1:8000'}/storage/${path}`
}