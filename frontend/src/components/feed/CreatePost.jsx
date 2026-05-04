import { useState, useRef } from 'react'
import { Image, Smile, MapPin, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'

export default function CreatePost({ onPostCreated }) {
  const { user }          = useAuthStore()
  const [caption, setCaption]   = useState('')
  const [files, setFiles]       = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading]   = useState(false)
  const fileInputRef            = useRef(null)
  const initials                = user?.name?.slice(0, 2).toUpperCase() ?? 'ME'

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).slice(0, 4) // max 4
    setFiles(selected)
    const urls = selected.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    e.target.value = ''
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!caption.trim() && files.length === 0) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('caption', caption)
      formData.append('type', files.length > 0 ? 'image' : 'text')
      files.forEach(f => formData.append('media[]', f))

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setCaption('')
      setFiles([])
      setPreviews([])
      toast.success('Posted!')
      onPostCreated?.()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors)[0][0])
      else toast.error('Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-3 border-b border-zinc-900">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>

        <div className="flex-1">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            rows={2}
            className="w-full bg-transparent text-white placeholder-zinc-600 text-[15px] resize-none focus:outline-none leading-relaxed"
          />

          {/* Image previews */}
          {previews.length > 0 && (
            <div className={`grid gap-1 mb-3 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {previews.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-zinc-900">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900">
            <div className="flex gap-3 text-[#3B9FE4]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hover:opacity-70 transition"
                title="Add image"
              >
                <Image size={18} />
              </button>
              <button className="hover:opacity-70 transition"><Smile size={18} /></button>
              <button className="hover:opacity-70 transition"><MapPin size={18} /></button>
            </div>

            {/* File count indicator */}
            {files.length > 0 && (
              <span className="text-zinc-500 text-xs">{files.length}/4</span>
            )}

            <button
              onClick={handleSubmit}
              disabled={(!caption.trim() && files.length === 0) || loading}
              className="px-4 py-1.5 bg-[#3B9FE4] text-white text-sm font-bold rounded-full hover:bg-[#2d8fd4] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Post
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  )
}