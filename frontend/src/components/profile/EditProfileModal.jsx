import { useState } from 'react'
import { X, Loader2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function EditProfileModal({ profile, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name:     profile.name     ?? '',
    username: profile.username ?? '',
    bio:      profile.bio      ?? '',
    website:  profile.website  ?? '',
  })
  const [avatar, setAvatar]   = useState(null)
  const [preview, setPreview] = useState(profile.avatar ?? null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

const handleSubmit = async () => {
  setLoading(true)
  try {
    // Update profile text fields
    await api.put('/users/profile', {
      name:     form.name,
      username: form.username,
      bio:      form.bio,
      website:  form.website,
    })

    // Upload avatar separately if changed
    if (avatar) {
      const formData = new FormData()
      formData.append('avatar', avatar)
      await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    toast.success('Profile updated!')
    onUpdated()
    onClose()
  } catch (err) {
    const errors = err.response?.data?.errors
    if (errors) toast.error(Object.values(errors)[0][0])
    else toast.error('Failed to update profile')
  } finally {
    setLoading(false)
  }
}

  const initials = form.name?.slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950">
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={20} />
          </button>
          <span className="text-white font-bold text-base">Edit Profile</span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-[#3B9FE4] font-bold text-sm hover:opacity-80 transition disabled:opacity-40 flex items-center gap-1"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Save
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center py-6 border-b border-zinc-800">
          <label className="relative cursor-pointer group">
            {preview ? (
              <img src={preview} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera size={22} className="text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          {[
            { label: 'Name',     name: 'name',     placeholder: 'Your full name',   type: 'text' },
            { label: 'Username', name: 'username', placeholder: 'yourhandle',       type: 'text' },
            { label: 'Website',  name: 'website',  placeholder: 'https://...',      type: 'url'  },
          ].map(({ label, name, placeholder, type }) => (
            <div key={name}>
              <label className="block text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>
          ))}

          {/* Bio */}
          <div>
            <label className="block text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell the world about yourself..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none"
            />
            <p className="text-zinc-600 text-xs mt-1 text-right">{form.bio.length}/160</p>
          </div>
        </div>
      </div>
    </div>
  )
}