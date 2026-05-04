import logo from '../assets/logo.png'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/feed')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0][0]
        toast.error(first)
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      {/* Logo */}
<div className="mb-8">
  <img src={logo} alt="SocialNetra" className="w-14 h-14 rounded-2xl" />
</div>

      <div className="w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Join SocialNetra today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B9FE4] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#2d8fd4] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3B9FE4] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}