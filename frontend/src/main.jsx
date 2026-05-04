import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import useThemeStore from './store/themeStore'

const queryClient = new QueryClient()

function Root() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [theme])

  return (
    <>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: theme === 'dark' ? '1px solid #333' : '1px solid #e5e5e5',
          },
        }}
      />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>,
)