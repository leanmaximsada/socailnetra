import api from '../lib/axios'
import { Loader2, RefreshCw } from 'lucide-react'
import PostCard from '../components/feed/PostCard'
import EmptyState from '../components/ui/EmptyState'
import StoriesBar from '../components/feed/StoriesBar'
import CreatePost from '../components/feed/CreatePost'
import AppLayout from '../components/layout/AppLayout'
import { PostSkeleton } from '../components/ui/Skeleton'
import InfiniteScroll from 'react-infinite-scroll-component'
import SuggestedUsers from '../components/feed/SuggestedUsers'
import { useEffect, useState, useCallback, useRef } from 'react'
import { MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share2 } from 'lucide-react'

export default function FeedPage() {
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const touchStartY               = useRef(0)
  const containerRef              = useRef(null)

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/feed?page=${pageNum}`)
      const data = res.data.data ?? res.data
      const lastPage = res.data.last_page ?? 1

      if (append) {
        setPosts(prev => {
          const ids = new Set(prev.map(p => p.id))
          return [...prev, ...data.filter(p => !ids.has(p.id))]
        })
      } else {
        setPosts(data)
      }
      setHasMore(pageNum < lastPage)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1, false)
  }, [fetchPosts])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setPage(1)
    await fetchPosts(1, false)
  }

  // Pull to refresh touch handlers
  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0 && delta < 100) {
      setPullDistance(delta)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handleRefresh()
    }
    setPullDistance(0)
    setIsPulling(false)
  }

  return (
    <AppLayout title="Home">
      {/* Pull to refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : refreshing ? '48px' : '0px' }}
      >
        <div className={`flex items-center gap-2 text-zinc-500 text-sm ${refreshing ? 'animate-pulse' : ''}`}>
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
            style={{ transform: `rotate(${(pullDistance / 60) * 180}deg)` }}
          />
          <span>{refreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <StoriesBar />
<CreatePost onPostCreated={handleRefresh} />
<SuggestedUsers />   {/* 👈 add this */}
{loading ? (
  <div>
    {[1,2,3,4,5].map(i => <PostSkeleton key={i} />)}
  </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={40} className="opacity-40" />}
            title="No posts yet"
            subtitle="Follow people or create your first post!"
            actionLabel="Create Post"
            actionPath="/create-post"
          />
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-zinc-600" />
              </div>
            }
            endMessage={
              <div className="flex items-center justify-center py-6 text-zinc-700 text-sm gap-2">
                <span>You're all caught up! 🎉</span>
              </div>
            }
            scrollThreshold={0.8}
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={handleRefresh} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </AppLayout>
  )
}