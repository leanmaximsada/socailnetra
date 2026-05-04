import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotificationPermission } from '../hooks/useNotificationPermission'
import { ArrowLeft, ChevronRight, Lock, Eye, EyeOff, LogOut, Trash2, Shield, User, Loader2, Check, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-zinc-500 text-xs uppercase tracking-wider px-4 mb-1">{title}</p>
      <div className="border-t border-b border-zinc-900">{children}</div>
    </div>
  )
}

function SettingRow({ icon: Icon, label, value, onClick, danger, toggle, toggled }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900 last:border-0 hover:bg-zinc-950 transition ${danger ? 'text-red-400' : 'text-white'}`}
    >
      <Icon size={18} className={danger ? 'text-red-400' : 'text-zinc-400'} />
      <span className="flex-1 text-left text-sm">{label}</span>
      {toggle ? (
        <div className={`w-11 h-6 rounded-full transition-colors ${toggled ? 'bg-[#3B9FE4]' : 'bg-zinc-700'} flex items-center px-1`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggled ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      ) : value ? (
        <span className="text-zinc-500 text-sm">{value}</span>
      ) : !danger ? (
        <ChevronRight size={16} className="text-zinc-600" />
      ) : null}
    </button>
  )
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/change-password', form)
      toast.success('Password changed!')
      onClose()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors)[0][0])
      else toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </button>
          <span className="text-white font-bold">Change Password</span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-[#3B9FE4] font-bold text-sm disabled:opacity-40 flex items-center gap-1"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Save
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          {[
            { label: 'Current Password',  name: 'current_password',      placeholder: '••••••••' },
            { label: 'New Password',       name: 'password',              placeholder: 'Min. 8 characters' },
            { label: 'Confirm Password',   name: 'password_confirmation', placeholder: 'Repeat new password' },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 pr-10 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowPw(!showPw)}
            className="flex items-center gap-1.5 text-zinc-500 text-xs hover:text-zinc-300 transition"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPw ? 'Hide' : 'Show'} passwords
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate              = useNavigate()
  const { user, logout, setAuth } = useAuthStore()
  const [showChangePw, setShowChangePw] = useState(false)
  const [isPrivate, setIsPrivate]       = useState(user?.is_private ?? false)
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { theme, toggleTheme } = useThemeStore()

  const { permission, requestPermission } = useNotificationPermission()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    logout()
    navigate('/login')
  }

  const togglePrivacy = async () => {
    setPrivacyLoading(true)
    try {
      const res = await api.put('/users/profile', { is_private: !isPrivate })
      setIsPrivate(res.data.is_private)
      setAuth(res.data, useAuthStore.getState().token)
      toast.success(`Account is now ${!isPrivate ? 'private' : 'public'}`)
    } catch {
      toast.error('Failed to update privacy')
    } finally {
      setPrivacyLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center gap-4 px-4 h-14">
        <button onClick={() => navigate(-1)} className="text-white hover:text-zinc-300 transition">
          <ArrowLeft size={20} />
        </button>
        <span className="text-white font-bold text-base">Settings</span>
      </header>

      <main className="pt-20 pb-10 max-w-lg mx-auto">
        {/* Appearance */}
<Section title="Appearance">
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900 last:border-0">
    {theme === 'dark'
      ? <Moon size={18} className="text-zinc-400" />
      : <Sun size={18} className="text-zinc-400" />
    }
    <span className="flex-1 text-sm text-white">
      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
    </span>
    <button
      onClick={toggleTheme}
      className={`w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#3B9FE4]' : 'bg-zinc-300'} flex items-center px-1`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
</Section>

        {/* Account info */}
        <div className="flex items-center gap-3 px-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold">{user?.name}</p>
            <p className="text-zinc-500 text-sm">@{user?.username}</p>
          </div>
        </div>

        {/* Account */}
        <Section title="Account">
          <SettingRow
            icon={User}
            label="Edit Profile"
            onClick={() => navigate('/profile')}
          />
          <SettingRow
  icon={Bell}
  label="Push Notifications"
  value={permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Off'}
  onClick={requestPermission}
/>
          <SettingRow
            icon={Lock}
            label="Change Password"
            onClick={() => setShowChangePw(true)}
          />
          <SettingRow
  icon={Bookmark}
  label="Saved Posts"
  onClick={() => navigate('/bookmarks')}
/>
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <SettingRow
            icon={Shield}
            label="Private Account"
            value={privacyLoading ? 'Saving...' : undefined}
            toggle={!privacyLoading}
            toggled={isPrivate}
            onClick={togglePrivacy}
          />
        </Section>

        {/* Account actions */}
        <Section title="More">
          <SettingRow
            icon={LogOut}
            label="Log Out"
            danger
            onClick={handleLogout}
          />
          <SettingRow
            icon={Trash2}
            label="Delete Account"
            danger
            onClick={() => setShowDeleteConfirm(true)}
          />
        </Section>

        {/* App version */}
        <p className="text-center text-zinc-700 text-xs mt-6">SocialNetra v1.0.0</p>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-white font-bold text-lg mb-2">Delete Account?</h2>
              <p className="text-zinc-400 text-sm mb-6">This action is permanent and cannot be undone. All your posts, followers and data will be lost.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 border border-zinc-700 text-white rounded-xl text-sm font-semibold hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => toast.error('Delete account coming soon')}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  )
}