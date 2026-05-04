import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import echo from '../lib/echo'
import useAuthStore from '../store/authStore'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name, username, avatar, size = 'sm' }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  const sz     = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  if (avatar) return <img src={avatar} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />
  return (
    <div className={`${sz} rounded-full ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

export default function ChatPage() {
  const { id }            = useParams()
  const navigate          = useNavigate()
  const { user: me }      = useAuthStore()
  const bottomRef         = useRef(null)
  const inputRef          = useRef(null)
  const lastMessageIdRef  = useRef(null)

  const [convo, setConvo]       = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)

  const otherUser = convo?.other_user
    ?? convo?.participants?.find(p => p.id !== me?.id)
    ?? convo?.participants?.[0]

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convoRes, msgRes] = await Promise.all([
          api.get(`/conversations/${id}`),
          api.get(`/conversations/${id}/messages`),
        ])
        setConvo(convoRes.data.data ?? convoRes.data)
        const msgs = msgRes.data.data ?? msgRes.data
        const reversed = Array.isArray(msgs) ? msgs.reverse() : []
        setMessages(reversed)
        if (reversed.length > 0) {
          lastMessageIdRef.current = reversed[reversed.length - 1].id
        }
        await api.post(`/conversations/${id}/read`).catch(() => {})
      } catch {
        toast.error('Failed to load chat')
        navigate('/messages')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // WebSocket + polling fallback
  useEffect(() => {
    if (!id) return

    // Poll every 3 seconds for new messages
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/conversations/${id}/messages`)
        const msgs = res.data.data ?? res.data
        const reversed = Array.isArray(msgs) ? msgs.reverse() : []
        setMessages(prev => {
          // Only update if there are new messages
          if (reversed.length > prev.filter(m => !m.temp).length) {
            return reversed
          }
          return prev
        })
      } catch {}
    }, 3000)

    // WebSocket listener
    if (echo) {
      const channel = echo.private(`conversation.${id}`)
      channel.listen('.new.message', (data) => {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev
          return [...prev, data]
        })
      })
    }

    return () => {
      clearInterval(poll)
      if (echo) echo.leave(`conversation.${id}`)
    }
  }, [id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!body.trim()) return
    setSending(true)
    const tempId  = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      body,
      sender_id: me?.id,
      sender: me,
      created_at: new Date().toISOString(),
      temp: true,
    }
    setMessages(prev => [...prev, tempMsg])
    setBody('')
    try {
      const res = await api.post(`/conversations/${id}/messages`, { body: tempMsg.body })
      const saved = res.data.data ?? res.data
      setMessages(prev => prev.map(m => m.id === tempId ? saved : m))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (msgId) => {
    try {
      await api.delete(`/messages/${msgId}`)
      setMessages(prev => prev.filter(m => m.id !== msgId))
    } catch {
      toast.error('Failed to delete message')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center gap-3 px-4 h-14">
        <button onClick={() => navigate('/messages')} className="text-white hover:text-zinc-300 transition">
          <ArrowLeft size={20} />
        </button>
        <Avatar name={otherUser?.name} username={otherUser?.username} avatar={otherUser?.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{otherUser?.name}</p>
          <p className="text-zinc-500 text-xs truncate">@{otherUser?.username}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-14 pb-20 px-4 overflow-y-auto max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-600">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === me?.id || msg.sender?.id === me?.id
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <Avatar name={otherUser?.name} username={otherUser?.username} avatar={otherUser?.avatar} />
                  )}
                  <div className="group relative max-w-[75%]">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#3B9FE4] text-white rounded-br-sm'
                        : 'bg-zinc-900 text-zinc-100 rounded-bl-sm'
                    } ${msg.temp ? 'opacity-70' : ''}`}>
                      {msg.body}
                    </div>
                    <p className={`text-zinc-600 text-[10px] mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {timeAgo(msg.created_at)}
                    </p>
                    {isMe && !msg.temp && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-zinc-900 rounded-full px-4 py-2.5 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Write a message..."
              className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!body.trim() || sending}
            className="w-10 h-10 bg-[#3B9FE4] rounded-full flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-[#2d8fd4] shrink-0"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

    </div>
  )
}