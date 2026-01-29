import React, { useState, useEffect } from 'react';
import { userService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, User, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [showPosts, setShowPosts] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await userService.getCurrentUser();
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
            setError("Failed to load profile.");
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const data = await userService.getUserPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch user posts", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const togglePosts = () => {
        if (!showPosts && posts.length === 0) {
            fetchUserPosts();
        }
        setShowPosts(!showPosts);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await userService.deleteUserPost(postId);
                setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
                console.error("Failed to delete post", err);
                alert("Failed to delete post.");
            }
        }
    };

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            {/* Profile Header Card */}
            <div className="relative bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-xl">
                {/* Cover Image Placeholder */}
                <div className="h-32 bg-gradient-to-r from-orange-900/40 to-amber-900/40 w-full relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-1 shadow-2xl shadow-orange-900/40">
                            <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center text-4xl font-bold text-white uppercase">
                                {user?.username?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-14 ml-2">
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            {user?.username}
                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                                Member
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-sm mb-6 flex flex-wrap gap-4">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {user?.email}
                            </span>
                            {/* Static placeholders for visual completeness as requested 'details' */}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Used API /users
                            </span>
                        </p>

                        {/* Stats / Actions */}
                        <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                            <button
                                onClick={togglePosts}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${showPosts ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-800 border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
                            >
                                <User className="w-4 h-4" />
                                {showPosts ? 'Hide My Posts' : 'Show My Posts'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className={`transition-all duration-500 ease-in-out ${showPosts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                    Your Contributions
                </h2>

                {loadingPosts ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                showDelete={true}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-white/5">
                        <p className="text-zinc-500">You haven't posted anything yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
