import { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Link2, Settings, UserPlus, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { ProfileSkeleton, PostSkeleton } from '../components/ui/Skeleton'
import AppLayout from "../components/layout/AppLayout";
import ProfileStats from "../components/profile/ProfileStats";
import PostsGrid from "../components/profile/PostsGrid";
import EditProfileModal from "../components/profile/EditProfileModal";
import { useProfile } from "../hooks/useProfile";
import useAuthStore from "../store/authStore";
import api from "../lib/axios";

export default function ProfilePage() {
    const { user: me, logout } = useAuthStore();
    const { username } = useParams();
    // const { user: me }              = useAuthStore()
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const targetUsername = username || me?.username;
    const isOwnProfile = !username || username === me?.username;

    const { profile, posts, loading, error, refetch } =
        useProfile(targetUsername);

    useEffect(() => {
        if (profile) setFollowing(profile.is_following ?? false);
    }, [profile]);

const toggleFollow = async () => {
    setFollowLoading(true);
    try {
        await api.post(`/users/${profile.id}/follow`);
        setFollowing((f) => !f);
        await refetch(); // await the refetch so it completes before state updates
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to follow";
        toast.error(msg);
    } finally {
        setFollowLoading(false);
    }
};

    const initials = profile?.name?.slice(0, 2).toUpperCase() ?? "??";
    const colors = [
        "bg-violet-600",
        "bg-blue-600",
        "bg-pink-600",
        "bg-orange-500",
        "bg-green-600",
    ];
    const color =
        colors[(profile?.username?.charCodeAt(0) ?? 0) % colors.length];

if (loading) {
  return (
    <AppLayout>
      <ProfileSkeleton />
    </AppLayout>
  )
}

    if (error) {
        return (
            <AppLayout title={isOwnProfile ? 'Profile' : profile?.name}>
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                    <p className="font-semibold">{error}</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            {/* Header */}
            <div className="px-4 pt-4">
                {/* Avatar row */}
                <div className="flex items-start justify-between mb-4">
                    {/* Avatar */}
                    {profile.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-800"
                        />
                    ) : (
                        <div
                            className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-white text-2xl font-bold border-2 border-zinc-800`}
                        >
                            {initials}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-1">
                        {isOwnProfile ? (
                            <>
                                <button
                                    onClick={() => setShowEdit(true)}
                                    className="px-4 py-1.5 border text-sm font-semibold rounded-full transition"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                                >
                                    Edit profile
                                </button>
                                <button
                                    onClick={() => navigate("/settings")}
                                    className="w-9 h-9 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 transition"
                                >
                                    <Settings size={16} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={toggleFollow}
                                disabled={followLoading}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition disabled:opacity-50 ${
                                    following
                                        ? "border border-zinc-700 text-white hover:border-red-500 hover:text-red-400"
                                        : "bg-[#3B9FE4] text-white hover:bg-[#2d8fd4]"
                                }`}
                            >
                                {followLoading ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : following ? (
                                    <UserCheck size={14} />
                                ) : (
                                    <UserPlus size={14} />
                                )}
                                {following ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Name + username */}
                <h1 className="font-bold text-xl leading-tight" style={{ color: 'var(--text-primary)' }}>{profile.name}</h1>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>@{profile.username}</p>  

                {/* Bio */}
                {profile.bio && (
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>{profile.bio}</p>
                )}

                {/* Website */}
                {profile.website && (
                    <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#3B9FE4] text-sm hover:underline mb-2"
                    >
                        <Link2 size={13} />
                        {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                )}

                {/* Stats */}
                <ProfileStats profile={profile} />
            </div>

            {/* Posts */}
            <PostsGrid posts={posts} username={targetUsername} />

            {/* Edit Modal */}
            {showEdit && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEdit(false)}
                    onUpdated={refetch}
                />
            )}
        </AppLayout>
    );
}
