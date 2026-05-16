import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HashtagPage from './pages/HashtagPage'
import SettingsPage from './pages/SettingsPage'
import StoryViewPage from './pages/StoryViewPage'
import BookmarksPage from './pages/BookmarksPage'
import ChatPage from './pages/ChatPage'
import PostDetailPage from './pages/PostDetailPage'
import useAuthStore from './store/authStore'
import LoginPage          from './pages/LoginPage'
import FeedPage           from './pages/FeedPage'
import SearchPage         from './pages/SearchPage'
import RegisterPage       from './pages/RegisterPage'
import ConversationsPage from './pages/ConversationsPage'
import NotificationsPage  from './pages/NotificationsPage'
import ProfilePage        from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/feed" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Navigate to="/login" replace />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="/hashtag/:name" element={<ProtectedRoute><HashtagPage /></ProtectedRoute>} />
        <Route path="/stories/:userId" element={<ProtectedRoute><StoryViewPage /></ProtectedRoute>} />
        <Route path="/messages"              element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
        <Route path="/messages/:id"          element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/login"         element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"      element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/feed"          element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/search"        element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/posts/:id"     element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
} 
