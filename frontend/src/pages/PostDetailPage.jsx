import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name, username, size = 'md' }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  const sz     = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

function CommentItem({ comment }) {
  const [liked, setLiked]           = useState(comment.is_liked ?? false)
  const [likesCount, setLikesCount] = useState(comment.likes_count ?? 0)

  const toggleLike = async () => {
    try {
      await api.post(`/comments/${comment.id}/like`)
      setLiked(!liked)
      setLikesCount(c => liked ? c - 1 : c + 1)
    } catch {}
  }

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-zinc-900">
      <Avatar name={comment.user?.name} username={comment.user?.username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-white font-semibold text-sm">{comment.user?.name}</span>
          <span className="text-zinc-500 text-xs">@{comment.user?.username}</span>
          <span className="text-zinc-600 text-xs">· {timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-zinc-200 text-sm leading-relaxed">{comment.body}</p>
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 mt-2 text-xs transition ${liked ? 'text-pink-500' : 'text-zinc-600 hover:text-pink-500'}`}
        >
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user: me } = useAuthStore()
  const inputRef     = useRef(null)

  const [post, setPost]             = useState(null)
  const [comments, setComments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [body, setBody]             = useState('')
  const [liked, setLiked]           = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  const fetchPost = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`),
      ])
      const p = postRes.data
      setPost(p)
      setLiked(p.is_liked ?? false)
      setLikesCount(p.likes_count ?? 0)
      setBookmarked(p.is_bookmarked ?? false)
      setComments(commentsRes.data.data ?? commentsRes.data)
    } catch {
      toast.error('Post not found')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPost() }, [id])

  const toggleLike = async () => {
    try {
      await api.post(`/posts/${id}/like`)
      setLiked(!liked)
      setLikesCount(c => liked ? c - 1 : c + 1)
    } catch {}
  }

  const toggleBookmark = async () => {
    try {
      await api.post(`/posts/${id}/bookmark`)
      setBookmarked(!bookmarked)
    } catch {}
  }

  const submitComment = async () => {
    if (!body.trim()) return
    setCommenting(true)
    try {
      const res = await api.post(`/posts/${id}/comments`, { body })
      setComments(prev => [{ ...res.data, user: me }, ...prev])
      setBody('')
      toast.success('Comment posted!')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors)[0][0])
      else toast.error('Failed to comment')
    } finally {
      setCommenting(false)
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center gap-4 px-4 h-14">
        <button onClick={() => navigate(-1)} className="text-white hover:text-zinc-300 transition">
          <ArrowLeft size={20} />
        </button>
        <span className="text-white font-bold text-base">Post</span>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 pt-14 pb-24 max-w-lg mx-auto w-full overflow-y-auto">

        {/* Post */}
        <div className="px-4 py-4 border-b border-zinc-900">
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={post.user?.name} username={post.user?.username} />
            <div>
              <p className="text-white font-bold text-sm leading-tight">{post.user?.name}</p>
              <p className="text-zinc-500 text-sm">@{post.user?.username}</p>
            </div>
          </div>

          {/* Content */}
          <p className="text-[17px] text-zinc-100 leading-relaxed whitespace-pre-wrap mb-4">
            {post.caption}
          </p>
          {/* Post images */}
{post.media && post.media.length > 0 && (
  <div className={`mt-3 grid gap-0.5 rounded-xl overflow-hidden ${
    post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
  }`}>
    {post.media.map((m) => {
      const url = m.url?.startsWith('http')
        ? m.url
        : `http://127.0.0.1:8000/storage/${m.url}`
      return m.type === 'video' ? (
        <video key={m.id} src={url} controls className="w-full rounded-lg max-h-96 object-cover" />
      ) : (
        <img key={m.id} src={url} alt="" className={`w-full object-cover ${post.media.length === 1 ? 'max-h-96' : 'aspect-square'} rounded-lg`} />
      )
    })}
  </div>
)}

          {/* Timestamp */}
          <p className="text-zinc-600 text-sm mb-4 pb-4 border-b border-zinc-900">
            {new Date(post.created_at).toLocaleString('en-US', {
              hour: 'numeric', minute: '2-digit',
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>

          {/* Stats */}
          {(likesCount > 0 || comments.length > 0) && (
            <div className="flex gap-4 text-sm pb-4 border-b border-zinc-900">
              {likesCount > 0 && (
                <span><strong className="text-white">{likesCount}</strong> <span className="text-zinc-500">Likes</span></span>
              )}
              {comments.length > 0 && (
                <span><strong className="text-white">{comments.length}</strong> <span className="text-zinc-500">Comments</span></span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 text-zinc-500">
            <button
              onClick={() => inputRef.current?.focus()}
              className="hover:text-blue-400 transition"
            >
              <MessageCircle size={20} />
            </button>
            <button className="hover:text-green-400 transition">
              <Repeat2 size={20} />
            </button>
            <button
              onClick={toggleLike}
              className={`transition ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={toggleBookmark}
              className={`transition ${bookmarked ? 'text-[#3B9FE4]' : 'hover:text-[#3B9FE4]'}`}
            >
              <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Comments */}
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <MessageCircle size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div>
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </div>
        )}
      </main>

      {/* Comment input — sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Avatar name={me?.name} username={me?.username} size="sm" />
          <div className="flex-1 flex items-center bg-zinc-900 rounded-full px-4 py-2 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
            />
            <button
              onClick={submitComment}
              disabled={!body.trim() || commenting}
              className="text-[#3B9FE4] disabled:opacity-30 transition hover:opacity-70"
            >
              {commenting
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />
              }
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}