import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, Loader2, Grid3X3, List } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import PostCard from '../components/feed/PostCard'
import EmptyState from '../components/ui/EmptyState'

function PostsGrid({ posts, onPostClick }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => onPostClick(post.id)}
          className="relative aspect-square bg-zinc-900 cursor-pointer overflow-hidden group"
        >
          {/* Show image if available */}
          {post.media && post.media.length > 0 ? (
            <img
              src={
                post.media[0].url?.startsWith('http')
                  ? post.media[0].url
                  : `http://127.0.0.1:8000/storage/${post.media[0].url}`
              }
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <p className="text-zinc-400 text-[10px] text-center line-clamp-4 leading-relaxed">
                {post.caption}
              </p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <span className="text-white text-xs font-bold">❤️ {post.likes_count ?? 0}</span>
            <span className="text-white text-xs font-bold">💬 {post.comments_count ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BookmarksPage() {
  const navigate          = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]   = useState('grid')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/bookmarks')
        setPosts(res.data.data ?? res.data)
      } catch {
        toast.error('Failed to load bookmarks')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white hover:text-zinc-300 transition">
            <ArrowLeft size={20} />
          </button>
          <span className="text-white font-bold text-base">Saved Posts</span>
        </div>

        {/* View toggle */}
        {posts.length > 0 && (
          <div className="flex gap-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition ${view === 'grid' ? 'text-[#3B9FE4]' : 'text-zinc-600'}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition ${view === 'list' ? 'text-[#3B9FE4]' : 'text-zinc-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        )}
      </header>

      <main className="pt-14 pb-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-zinc-500" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
  icon="🔖"
  title="No saved posts yet"
  subtitle="Tap the bookmark icon on any post to save it"
/>
        ) : view === 'grid' ? (
          <PostsGrid posts={posts} onPostClick={(id) => navigate(`/posts/${id}`)} />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}