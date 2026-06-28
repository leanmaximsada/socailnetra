import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, MessageCircle, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import AppLayout from '../components/layout/AppLayout'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import { MessageSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function Avatar({ name, username, avatar }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  if (avatar) return <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0" />
  return (
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

export default function ConversationsPage() {
  const navigate          = useNavigate()
  const { user: me }      = useAuthStore()
  const [convos, setConvos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/conversations')
        setConvos(res.data.data ?? res.data)
      } catch {
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get('/search', { params: { q: searchQ } })
        setSearchResults(res.data.users ?? [])
      } catch {} finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [searchQ])

  const startConversation = async (userId) => {
    try {
      const res = await api.post('/conversations', { user_id: userId })
      const convoId = res.data.id ?? res.data.data?.id
      navigate(`/messages/${convoId}`)
    } catch {
      toast.error('Failed to start conversation')
    }
  }

const getOtherUser = (convo) => {
  if (convo.other_user) return convo.other_user
  // Handle user_one / user_two format
  if (convo.user_one && convo.user_two) {
    return convo.user_one_id === me?.id ? convo.user_two : convo.user_one
  }
  const participants = convo.participants ?? []
  return participants.find(p => p.id !== me?.id) ?? participants[0]
}

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 sticky top-14 bg-black z-30">
        <h1 className="text-white font-bold text-lg">Messages</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="text-[#3B9FE4] hover:opacity-70 transition"
        >
          <Edit size={20} />
        </button>
      </div>

      {/* New message search */}
      {showNew && (
        <div className="border-b border-zinc-900 px-4 py-3 bg-zinc-950">
          <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider">New Message — Search user</p>
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
            autoFocus
          />
          {searching && <p className="text-zinc-600 text-xs mt-2">Searching...</p>}
          {searchResults.map(user => (
            <div
              key={user.id}
              onClick={() => startConversation(user.id)}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:opacity-80 transition mt-1"
            >
              <Avatar name={user.name} username={user.username} avatar={user.avatar} />
              <div>
                <p className="text-white text-sm font-semibold">{user.name}</p>
                <p className="text-zinc-500 text-xs">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversations list */}
{loading ? (
  <div>
    {[1,2,3,4].map(i => <MessageSkeleton key={i} />)}
  </div>
      ) : convos.length === 0 ? (
<EmptyState
  icon="💬"
  title="No messages yet"
  subtitle="Start a conversation with someone"
  actionLabel="Find people"
  actionPath="/search"
/>
      ) : (
        <div>
          {convos.map((convo) => {
            const other = getOtherUser(convo)
            const lastMsg = convo.last_message
            return (
              <div
                key={convo.id}
                onClick={() => navigate(`/messages/${convo.id}`)}
                className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 hover:bg-zinc-950 transition cursor-pointer"
              >
                <Avatar name={other?.name} username={other?.username} avatar={other?.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-white font-semibold text-sm truncate">{other?.name}</p>
                    <p className="text-zinc-600 text-xs shrink-0 ml-2">{timeAgo(lastMsg?.created_at)}</p>
                  </div>
                  <p className="text-zinc-500 text-sm truncate">
                    {lastMsg?.body ?? 'No messages yet'}
                  </p>
                </div>
                {convo.unread_count > 0 && (
                  <div className="w-5 h-5 bg-[#3B9FE4] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{convo.unread_count}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}