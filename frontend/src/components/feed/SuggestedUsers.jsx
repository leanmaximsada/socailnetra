import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

function Avatar({ name, username, avatar }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  if (avatar) return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800" />
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

function UserCard({ user, onFollow, onDismiss }) {
  const navigate          = useNavigate()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleFollow = async () => {
    setLoading(true)
    try {
      await api.post(`/users/${user.id}/follow`)
      setFollowing(true)
      onFollow?.(user.id)
      toast.success(`Following ${user.name}!`)
    } catch {
      toast.error('Failed to follow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-950/50 transition-colors">
      {/* Avatar */}
      <div
        className="cursor-pointer shrink-0"
        onClick={() => navigate(`/profile/${user.username}`)}
      >
        <Avatar name={user.name} username={user.username} avatar={user.avatar} />
      </div>

      {/* Info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => navigate(`/profile/${user.username}`)}
      >
        <div className="flex items-center gap-1">
          <p className="text-white font-semibold text-sm truncate leading-tight">{user.name}</p>
          {user.is_verified && <span className="text-[#3B9FE4] text-xs shrink-0">✓</span>}
        </div>
        <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
        <p className="text-zinc-600 text-xs">{user.followers_count} followers</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {following ? (
          <span className="text-zinc-500 text-xs">Following</span>
        ) : (
          <button
            onClick={handleFollow}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#3B9FE4] text-white text-xs font-bold rounded-full hover:bg-[#2d8fd4] transition disabled:opacity-50"
          >
            {loading
              ? <Loader2 size={11} className="animate-spin" />
              : <UserPlus size={11} />
            }
            Follow
          </button>
        )}
        <button
          onClick={() => onDismiss?.(user.id)}
          className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default function SuggestedUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/users/suggested')
        setUsers(res.data)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleDismiss = (userId) => {
    setDismissed(prev => [...prev, userId])
  }

  const handleFollow = (userId) => {
    // Auto-dismiss after 2 seconds when followed
    setTimeout(() => handleDismiss(userId), 2000)
  }

  const visibleUsers = users.filter(u => !dismissed.includes(u.id)).slice(0, 5)

  if (loading || visibleUsers.length === 0) return null

  return (
    <div className="border-b border-zinc-900 py-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">Who to follow</h3>
      </div>

      {/* User cards */}
      <div>
        {visibleUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onFollow={handleFollow}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  )
}