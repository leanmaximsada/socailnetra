import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Hash, Loader2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import PostCard from '../components/feed/PostCard'
import api from '../lib/axios'

export default function HashtagPage() {
  const { name }     = useParams()
  const navigate     = useNavigate()
  const [hashtag, setHashtag] = useState(null)
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [tagRes, postsRes] = await Promise.all([
          api.get(`/hashtags/${name}`),
          api.get(`/hashtags/${name}/posts`),
        ])
        setHashtag(tagRes.data)
        setPosts(postsRes.data.data ?? postsRes.data)
      } catch {
        navigate('/search')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [name])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center gap-4 px-4 h-14">
        <button onClick={() => navigate(-1)} className="text-white hover:text-zinc-300 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-white font-bold text-base">#{name}</p>
          {hashtag && <p className="text-zinc-500 text-xs">{hashtag.posts_count} posts</p>}
        </div>
      </header>

      <main className="pt-14 pb-6 max-w-lg mx-auto">
        {/* Hashtag hero */}
        <div className="flex items-center gap-4 px-4 py-6 border-b border-zinc-900">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Hash size={28} className="text-[#3B9FE4]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">#{name}</h1>
            <p className="text-zinc-500 text-sm">{hashtag?.posts_count ?? 0} posts</p>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-zinc-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Hash size={40} className="mb-3 opacity-40" />
            <p className="font-semibold">No posts with #{name} yet</p>
          </div>
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