import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, Hash, UserRound, TrendingUp, Flame } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import AppLayout from '../components/layout/AppLayout'
import PostCard from '../components/feed/PostCard'
import api from '../lib/axios'

function Avatar({ name, username, avatar }) {
  const colors = ['bg-violet-600','bg-blue-600','bg-pink-600','bg-orange-500','bg-green-600']
  const color  = colors[(username?.charCodeAt(0) ?? 0) % colors.length]
  if (avatar) return <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0" />
  return (
    <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

function UserResult({ user, onClick }) {
  return (
    <div onClick={() => onClick(user.username)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition cursor-pointer border-b border-zinc-900">
      <Avatar name={user.name} username={user.username} avatar={user.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-white font-semibold text-sm truncate">{user.name}</p>
          {user.is_verified && <span className="text-[#3B9FE4] text-xs">✓</span>}
        </div>
        <p className="text-zinc-500 text-sm truncate">@{user.username}</p>
      </div>
      <p className="text-zinc-600 text-xs shrink-0">{user.followers_count} followers</p>
    </div>
  )
}

function HashtagResult({ hashtag, onClick, rank }) {
  return (
    <div onClick={() => onClick(hashtag.name)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition cursor-pointer border-b border-zinc-900">
      <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
        <Hash size={18} className="text-[#3B9FE4]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">#{hashtag.name}</p>
        <p className="text-zinc-500 text-xs">{hashtag.posts_count} posts</p>
      </div>
      {rank && <span className="text-zinc-700 text-xs font-bold">#{rank}</span>}
    </div>
  )
}

function PostsGrid({ posts, onPostClick }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => onPostClick(post.id)}
          className="relative aspect-square bg-zinc-900 cursor-pointer overflow-hidden group"
        >
          {post.media && post.media.length > 0 ? (
            <img
              src={post.media[0].url?.startsWith('http') ? post.media[0].url : `http://127.0.0.1:8000/storage/${post.media[0].url}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <p className="text-zinc-400 text-[10px] text-center line-clamp-4 leading-relaxed">{post.caption}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <span className="text-white text-xs font-bold">❤️ {post.likes_count ?? 0}</span>
            <span className="text-white text-xs font-bold">💬 {post.comments_count ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const navigate              = useNavigate()
  const inputRef              = useRef(null)
  const debounceRef           = useRef(null)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState({ users: [], hashtags: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [tab, setTab]         = useState('trending')
  const [trending, setTrending]       = useState({ posts: [], hashtags: [] })
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [trendingPage, setTrendingPage] = useState(1)
  const [hasMoreTrending, setHasMoreTrending] = useState(true)

  // Fetch initial explore data
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [postsRes, hashtagsRes] = await Promise.all([
          api.get('/explore?page=1'),
          api.get('/explore/trending'),
        ])
        const posts = postsRes.data.data ?? postsRes.data
        setTrending({
          posts,
          hashtags: hashtagsRes.data,
        })
        const currentPage = postsRes.data.current_page ?? 1
        const lastPage    = postsRes.data.last_page ?? 1
        setHasMoreTrending(currentPage < lastPage)
      } catch {
        setHasMoreTrending(false)
      } finally {
        setLoadingTrend(false)
      }
    }
    fetchTrending()
  }, [])

  const loadMoreTrending = async () => {
    const nextPage = trendingPage + 1
    try {
      const res = await api.get(`/explore?page=${nextPage}`)
      const newPosts = res.data.data ?? res.data
      setTrending(prev => ({ ...prev, posts: [...prev.posts, ...newPosts] }))
      const lastPage = res.data.last_page ?? 1
      setHasMoreTrending(nextPage < lastPage)
      setTrendingPage(nextPage)
    } catch {
      setHasMoreTrending(false)
    }
  }

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], hashtags: [] })
      setSearched(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get('/search', { params: { q: query } })
        setResults(res.data)
        setSearched(true)
      } catch {
        setResults({ users: [], hashtags: [] })
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const totalResults = results.users.length + results.hashtags.length

  return (
    <AppLayout title="Search">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-zinc-900 sticky top-14 bg-black z-30">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2.5">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users or hashtags..."
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-zinc-300 transition">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {query ? (
        <>
          {loading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-zinc-500" /></div>}
          {searched && !loading && totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <Search size={40} className="mb-3 opacity-40" />
              <p className="font-semibold mb-1">No results for "{query}"</p>
            </div>
          )}
          {!loading && totalResults > 0 && (
            <div>
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-b border-zinc-900">
                    <UserRound size={14} className="text-zinc-500" />
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">People</span>
                  </div>
                  {results.users.map(u => <UserResult key={u.id} user={u} onClick={(un) => navigate(`/profile/${un}`)} />)}
                </div>
              )}
              {results.hashtags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-b border-zinc-900">
                    <Hash size={14} className="text-zinc-500" />
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Hashtags</span>
                  </div>
                  {results.hashtags.map(t => <HashtagResult key={t.id} hashtag={t} onClick={(n) => navigate(`/hashtag/${n}`)} />)}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-zinc-900 sticky top-28 bg-black z-20">
            <button
              onClick={() => setTab('trending')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition ${tab === 'trending' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'}`}
            >
              <TrendingUp size={16} /> Trending
            </button>
            <button
              onClick={() => setTab('hashtags')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition ${tab === 'hashtags' ? 'border-[#3B9FE4] text-[#3B9FE4]' : 'border-transparent text-zinc-600'}`}
            >
              <Flame size={16} /> Hashtags
            </button>
          </div>

          {loadingTrend ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-zinc-500" /></div>
          ) : tab === 'trending' ? (
            trending.posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <TrendingUp size={40} className="mb-3 opacity-40" />
                <p className="font-semibold">No trending posts yet</p>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={trending.posts.length}
                next={loadMoreTrending}
                hasMore={hasMoreTrending}
                loader={<div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-zinc-600" /></div>}
                endMessage={<div className="flex justify-center py-4 text-zinc-700 text-xs">No more posts</div>}
              >
                <PostsGrid posts={trending.posts} onPostClick={(id) => navigate(`/posts/${id}`)} />
              </InfiniteScroll>
            )
          ) : (
            trending.hashtags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <Hash size={40} className="mb-3 opacity-40" />
                <p className="font-semibold">No trending hashtags yet</p>
              </div>
            ) : (
              <div>
                {trending.hashtags.map((tag, i) => (
                  <HashtagResult key={tag.id} hashtag={tag} rank={i + 1} onClick={(n) => navigate(`/hashtag/${n}`)} />
                ))}
              </div>
            )
          )}
        </>
      )}
    </AppLayout>
  )
}