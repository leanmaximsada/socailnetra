import { useState } from 'react'
import { MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { storageUrl } from '../../lib/axios'
import LikeButton from './LikeButton'
import LikesModal from './LikesModal'


function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function Avatar({ name, username, avatar }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  if (avatar) return <img src={storageUrl(avatar)} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800" />
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

export default function PostCard({ post, onUpdate }) {
  const navigate                        = useNavigate()
  const [liked, setLiked]               = useState(post.is_liked ?? false)
  const [likesCount, setLikesCount]     = useState(post.likes_count ?? 0)
  const [bookmarked, setBookmarked]     = useState(post.is_bookmarked ?? false)
  const [bookmarkAnim, setBookmarkAnim] = useState(false)
  const [showLikes, setShowLikes]       = useState(false)

  const [reposted, setReposted]       = useState(post.is_reposted ?? false)
const [repostsCount, setRepostsCount] = useState(post.reposts_count ?? 0)

const toggleRepost = async () => {
  setReposted(!reposted)
  setRepostsCount(c => reposted ? c - 1 : c + 1)
  try {
    await api.post(`/posts/${post.id}/repost`)
  } catch {
    setReposted(reposted)
    setRepostsCount(c => reposted ? c + 1 : c - 1)
    toast.error('Failed to repost')
  }
}

  const toggleLike = async () => {
    setLiked(!liked)
    setLikesCount(c => liked ? c - 1 : c + 1)
    try {
      await api.post(`/posts/${post.id}/like`)
    } catch {
      setLiked(liked)
      setLikesCount(c => liked ? c + 1 : c - 1)
    }
  }

  const toggleBookmark = async () => {
    setBookmarkAnim(true)
    setTimeout(() => setBookmarkAnim(false), 400)
    setBookmarked(!bookmarked)
    try {
      await api.post(`/posts/${post.id}/bookmark`)
    } catch {
      setBookmarked(bookmarked)
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`)
    toast.success('Link copied!')
  }

  return (
    <>
      <div className="flex gap-3 px-4 py-4 border-b border-zinc-900 hover:bg-zinc-950/50 transition-colors duration-200 cursor-pointer group">
        {/* Avatar */}
        <div onClick={() => navigate(`/profile/${post.user?.username}`)}>
          <Avatar name={post.user?.name} username={post.user?.username} avatar={post.user?.avatar} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div
              className="flex items-center gap-1.5 min-w-0 cursor-pointer"
              onClick={() => navigate(`/profile/${post.user?.username}`)}
            >
              <span className="text-white font-bold text-sm hover:underline truncate">{post.user?.name}</span>
              {post.user?.is_verified && (
                <span className="text-[#3B9FE4] text-xs shrink-0">✓</span>
              )}
              <span className="text-zinc-500 text-sm truncate">@{post.user?.username}</span>
              <span className="text-zinc-600 text-xs shrink-0">· {timeAgo(post.created_at)}</span>
            </div>
            <button className="text-zinc-600 hover:text-zinc-400 transition opacity-0 group-hover:opacity-100 shrink-0 ml-2">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Post text */}
          <div onClick={() => navigate(`/posts/${post.id}`)}>
            {post.caption && (
              <p className="text-[15px] text-zinc-100 leading-relaxed whitespace-pre-wrap break-words mb-2">
                {post.caption}
              </p>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className={`grid gap-0.5 rounded-2xl overflow-hidden mb-2 ${
                post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {post.media.map((m) => {
const url = storageUrl(m.url)
                  return m.type === 'video' ? (
                    <video key={m.id} src={url} controls className="w-full object-cover max-h-80" />
                  ) : (
                    <img
                      key={m.id}
                      src={url}
                      alt=""
                      className={`w-full object-cover ${post.media.length === 1 ? 'max-h-80' : 'aspect-square'}`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 max-w-xs">
            {/* Comment */}
            <button
              onClick={() => navigate(`/posts/${post.id}`)}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors duration-200"
            >
              <MessageCircle size={18} />
              <span className="text-xs">{post.comments_count ?? 0}</span>
            </button>

{/* Repost */}
<button
  onClick={toggleRepost}
  className={`flex items-center gap-1.5 transition-colors duration-200 ${
    reposted ? 'text-green-400' : 'text-zinc-500 hover:text-green-400'
  }`}
>
  <Repeat2 size={18} />
  <span className="text-xs">{repostsCount}</span>
</button>

            {/* Like + likes count */}
            <div className="flex items-center gap-1">
              <LikeButton liked={liked} count={0} onToggle={toggleLike} showCount={false} />
              <button
                onClick={() => likesCount > 0 && setShowLikes(true)}
                className="text-xs tabular-nums hover:underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-1.5 transition-all duration-200 ${
                bookmarked ? 'text-[#3B9FE4]' : 'text-zinc-500 hover:text-[#3B9FE4]'
              }`}
            >
              <Bookmark
                size={18}
                fill={bookmarked ? 'currentColor' : 'none'}
                className={`transition-transform duration-200 ${bookmarkAnim ? 'scale-125' : 'scale-100'}`}
              />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Likes Modal - must be inside the return but outside the post div */}
      {showLikes && (
        <LikesModal postId={post.id} onClose={() => setShowLikes(false)} />
      )}
    </>
  )
}