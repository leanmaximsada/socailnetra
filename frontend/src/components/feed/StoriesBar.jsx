import { useState, useEffect, useRef } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../lib/axios'
import { StoryAvatarSkeleton } from '../ui/Skeleton'

function StoryAvatar({ user, hasSeen, onClick }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(user?.username?.charCodeAt(0) ?? 0) % colors.length]

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={onClick}>
      <div className={`p-0.5 rounded-full ${hasSeen ? 'bg-zinc-800' : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400'}`}>
        <div className="bg-black p-0.5 rounded-full">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}>
              {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
          )}
        </div>
      </div>
      <span className="text-zinc-400 text-[11px] w-14 text-center truncate">@{user?.username}</span>
    </div>
  )
}

export default function StoriesBar() {
  const { user }        = useAuthStore()
  const navigate        = useNavigate()
  const fileInputRef    = useRef(null)
  const [stories, setStories]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/stories')
        setStories(res.data)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('media', file)
      await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Refresh stories
      const res = await api.get('/stories')
      setStories(res.data)
      e.target.value = ''
    } catch {
      alert('Failed to upload story')
    } finally {
      setUploading(false)
    }
  }

  const myStoryGroup = stories.find(s => s.user?.id === user?.id)

  return (
    <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-zinc-900">
      {/* Your story */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div
          className="relative cursor-pointer"
          onClick={() => myStoryGroup ? navigate(`/stories/${user?.id}`) : fileInputRef.current?.click()}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
            </div>
          )}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#3B9FE4] rounded-full flex items-center justify-center border-2 border-black cursor-pointer"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            {uploading ? <Loader2 size={10} className="animate-spin text-white" /> : <Plus size={11} strokeWidth={3} className="text-white" />}
          </div>
        </div>
        <span className="text-zinc-400 text-[11px] w-14 text-center truncate">
          {uploading ? 'Uploading...' : 'Your story'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Others' stories */}
{loading ? (
  <>
    {[1,2,3,4].map(i => <StoryAvatarSkeleton key={i} />)}
  </>
      ) : (
        stories
          .filter(s => s.user?.id !== user?.id)
          .map((group) => (
            <StoryAvatar
              key={group.user?.id}
              user={group.user}
              hasSeen={!group.has_unseen}
              onClick={() => navigate(`/stories/${group.user?.id}`)}
            />
          ))
      )}
    </div>
  )
}