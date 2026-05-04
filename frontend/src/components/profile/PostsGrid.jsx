import { useState } from 'react'
import { Grid3X3, List, Heart, MessageCircle } from 'lucide-react'
import PostCard from '../feed/PostCard'

function GridItem({ post }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative aspect-square cursor-pointer overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Placeholder visual */}
      <div className="w-full h-full flex items-center justify-center p-2">
        <p className="text-zinc-400 text-[11px] text-center line-clamp-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {post.caption}
        </p>
      </div>

      {/* Hover overlay */}
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

export default function PostsGrid({ posts }) {
  const [view, setView] = useState('grid')

  return (
    <div>
      {/* Toggle */}
      <div className="flex border-b border-zinc-900">
        <button
          onClick={() => setView('grid')}
          className={`flex-1 flex justify-center py-3 transition border-b-2 ${
            view === 'grid' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'
          }`}
        >
          <Grid3X3 size={20} />
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex-1 flex justify-center py-3 transition border-b-2 ${
            view === 'list' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'
          }`}
        >
          <List size={20} />
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
          <p className="font-semibold mb-1">No posts yet</p>
          <p className="text-sm">Posts will appear here</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-3 gap-0.5">
          {posts.map((post) => <GridItem key={post.id} post={post} />)}
        </div>
      ) : (
        <div>
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}