import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2 } from 'lucide-react'
import api from '../../lib/axios'

function Avatar({ name, username, avatar }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  if (avatar) return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

export default function LikesModal({ postId, onClose }) {
  const navigate        = useNavigate()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await api.get(`/posts/${postId}/likes`)
        setUsers(res.data.data ?? res.data)
      } catch {
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchLikes()
  }, [postId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden z-10" style={{ backgroundColor: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Likes</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <X size={20} />
          </button>
        </div>

        {/* Users list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-zinc-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <p className="text-sm">No likes yet</p>
            </div>
          ) : (
users.map(like => (
  <div
    key={like.id}
    onClick={() => { navigate(`/profile/${like.user?.username}`); onClose() }}
    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 transition border-b last:border-0"
    style={{ borderColor: 'var(--border)' }}
  >
    <Avatar name={like.user?.name} username={like.user?.username} avatar={like.user?.avatar} />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{like.user?.name}</p>
      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>@{like.user?.username}</p>
    </div>
  </div>
))
            
          )}
          
        </div>
      </div>
    </div>
  )
}