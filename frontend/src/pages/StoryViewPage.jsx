import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

const STORY_DURATION = 5000 // 5 seconds per story

export default function StoryViewPage() {
  const { userId }       = useParams()
  const navigate         = useNavigate()
  const { user: me }     = useAuthStore()
  const timerRef         = useRef(null)
  const [allGroups, setAllGroups]       = useState([])
  const [groupIndex, setGroupIndex]     = useState(0)
  const [storyIndex, setStoryIndex]     = useState(0)
  const [loading, setLoading]           = useState(true)
  const [progress, setProgress]         = useState(0)
  const progressRef                     = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/stories')
        const groups = res.data
        setAllGroups(groups)
        const idx = groups.findIndex(g => g.user?.id === parseInt(userId))
        setGroupIndex(idx >= 0 ? idx : 0)
      } catch {
        navigate('/feed')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [userId])

  const currentGroup = allGroups[groupIndex]
  const currentStory = currentGroup?.stories?.[storyIndex]

  // Mark as viewed
  useEffect(() => {
    if (!currentStory) return
    api.post(`/stories/${currentStory.id}/view`).catch(() => {})
  }, [currentStory?.id])

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory) return
    setProgress(0)
    clearInterval(timerRef.current)

    const start = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(progressRef.current)
        goNext()
      }
    }, 50)

    return () => clearInterval(progressRef.current)
  }, [currentStory?.id])

  const goNext = () => {
    const group = allGroups[groupIndex]
    if (storyIndex < (group?.stories?.length ?? 0) - 1) {
      setStoryIndex(i => i + 1)
    } else if (groupIndex < allGroups.length - 1) {
      setGroupIndex(i => i + 1)
      setStoryIndex(0)
    } else {
      navigate('/feed')
    }
  }

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(i => i - 1)
    } else if (groupIndex > 0) {
      setGroupIndex(i => i - 1)
      setStoryIndex(0)
    }
  }

  const deleteStory = async () => {
    if (!currentStory) return
    try {
      await api.delete(`/stories/${currentStory.id}`)
      toast.success('Story deleted')
      navigate('/feed')
    } catch {
      toast.error('Failed to delete story')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white" />
      </div>
    )
  }

  if (!currentStory) {
    navigate('/feed')
    return null
  }

  const isOwnStory = currentStory.user_id === me?.id
  const mediaUrl   = currentStory.media_url?.startsWith('http')
    ? currentStory.media_url
    : `http://127.0.0.1:8000/storage/${currentStory.media_url}`

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-sm h-screen bg-zinc-950 overflow-hidden">

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
          {currentGroup?.stories?.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-2">
            {currentGroup?.user?.avatar ? (
              <img src={currentGroup.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                {currentGroup?.user?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-white text-sm font-semibold">{currentGroup?.user?.name}</span>
            <span className="text-white/60 text-xs">
              {new Date(currentStory.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isOwnStory && (
              <button onClick={deleteStory} className="text-white/80 hover:text-red-400 transition">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="w-full h-full">
          {currentStory.type === 'video' ? (
            <video
              key={currentStory.id}
              src={mediaUrl}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              key={currentStory.id}
              src={mediaUrl}
              alt="story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Text overlay */}
        {currentStory.text_overlay && (
          <div className="absolute bottom-20 left-0 right-0 z-20 px-6">
            <p className="text-white text-lg font-semibold text-center drop-shadow-lg">
              {currentStory.text_overlay}
            </p>
          </div>
        )}

        {/* Tap zones */}
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1" onClick={goPrev} />
          <div className="flex-1" onClick={goNext} />
        </div>

        {/* Nav arrows */}
        {groupIndex > 0 || storyIndex > 0 ? (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition"
          >
            <ChevronLeft size={28} />
          </button>
        ) : null}
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition"
        >
          <ChevronRight size={28} />
        </button>

        {/* Views count (own story) */}
        {isOwnStory && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-xs">
              👁 {currentStory.views_count ?? 0} views
            </div>
          </div>
        )}
      </div>
    </div>
  )
}