import logo from "../assets/logo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ login: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Sending:', { login: form.login, password: form.password })
            const res = await api.post("/auth/login", form);
            setAuth(res.data.user, res.data.token);
            toast.success("Welcome back!");
            navigate("/feed");
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <div className="mb-10">
                <img
                    src={logo}
                    alt="SocialNetra"
                    className="w-14 h-14 rounded-2xl"
                />
            </div>

            {/* Card */}
            <div className="w-full max-w-sm">
                <h1 className="text-white text-3xl font-bold mb-2">
                    Sign in to SocialNetra
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    Enter your credentials to continue
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">
                            Email or Username
                        </label>
                        <input
                            type="text"
                            name="login"
                            value={form.login}
                            onChange={handleChange}
                            placeholder="Email or username"
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#3B9FE4] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#2d8fd4] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {loading && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-zinc-600 text-xs">or</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Register link */}
                <p className="text-center text-gray-500 text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-[#3B9FE4] font-semibold hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
