import { useState, useEffect } from 'react'
import { Grid3X3, List, Heart, MessageCircle, Repeat2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PostCard from '../feed/PostCard'
import api from '../../lib/axios'

function GridItem({ post, onClick }) {
  const [hover, setHover] = useState(false)
  const firstMedia = post.media?.[0]

  return (
    <div
      className="relative aspect-square cursor-pointer overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {firstMedia ? (
        <img
          src={firstMedia.url}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <p className="text-[11px] text-center line-clamp-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {post.caption}
          </p>
        </div>
      )}

      {hover && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-white">
            <Heart size={16} fill="white" />
            <span className="text-sm font-bold">{post.likes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <MessageCircle size={16} fill="white" />
            <span className="text-sm font-bold">{post.comments_count ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PostsGrid({ posts, username }) {
  const navigate              = useNavigate()
  const [view, setView]       = useState('grid')
  const [tab, setTab]         = useState('posts')
  const [reposts, setReposts] = useState([])
  const [loadingReposts, setLoadingReposts] = useState(false)

  useEffect(() => {
    if (tab === 'reposts' && username) {
      setLoadingReposts(true)
      api.get(`/users/${username}/reposts`)
        .then(res => setReposts(res.data.data ?? res.data))
        .catch(() => setReposts([]))
        .finally(() => setLoadingReposts(false))
    }
  }, [tab, username])

  const activePosts = tab === 'posts' ? posts : reposts

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setTab('posts')}
          className={`flex-1 flex justify-center py-3 transition border-b-2 ${
            tab === 'posts' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'
          }`}
        >
          <Grid3X3 size={20} />
        </button>
        <button
          onClick={() => setTab('reposts')}
          className={`flex-1 flex justify-center py-3 transition border-b-2 ${
            tab === 'reposts' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'
          }`}
        >
          <Repeat2 size={20} />
        </button>
        <button
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          className={`flex-1 flex justify-center py-3 transition border-b-2 ${
            view === 'list' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'
          }`}
        >
          <List size={20} />
        </button>
      </div>

      {/* Loading */}
      {loadingReposts && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      )}

      {/* Empty state */}
      {!loadingReposts && activePosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
          <p className="font-semibold mb-1">
            {tab === 'posts' ? 'No posts yet' : 'No reposts yet'}
          </p>
          <p className="text-sm">
            {tab === 'posts' ? 'Posts will appear here' : 'Reposts will appear here'}
          </p>
        </div>
      )}

      {/* Content */}
      {!loadingReposts && activePosts.length > 0 && (
        view === 'grid' ? (
          <div className="grid grid-cols-3 gap-0.5">
            {activePosts.map((item) => {
              const post = tab === 'reposts' ? item.post : item
              if (!post) return null
              return (
                <GridItem
                  key={item.id}
                  post={post}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              )
            })}
          </div>
        ) : (
          <div>
            {activePosts.map((item) => {
              const post = tab === 'reposts' ? item.post : item
              if (!post) return null
              return <PostCard key={item.id} post={post} />
            })}
          </div>
        )
      )}
    </div>
  )
}