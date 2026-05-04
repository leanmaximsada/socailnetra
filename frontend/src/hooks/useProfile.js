import { useState, useEffect } from 'react'
import api from '../lib/axios'

export function useProfile(username) {
  const [profile, setProfile]   = useState(null)
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(true)

  const fetchProfile = async () => {
    if (!username) return
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts?page=1`),
      ])
      setProfile(profileRes.data.user)
      setPosts(postsRes.data.data ?? postsRes.data)
      setHasMore((postsRes.data.current_page ?? 1) < (postsRes.data.last_page ?? 1))
      setPage(1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    const nextPage = page + 1
    try {
      const res = await api.get(`/users/${username}/posts?page=${nextPage}`)
      const newPosts = res.data.data ?? res.data
      setPosts(prev => [...prev, ...newPosts])
      setHasMore(nextPage < (res.data.last_page ?? 1))
      setPage(nextPage)
    } catch {}
  }

  useEffect(() => { fetchProfile() }, [username])

  return { profile, posts, loading, error, refetch: fetchProfile, loadMorePosts, hasMore }
}