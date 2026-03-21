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
    const [deleteError, setDeleteError] = useState('');
    const [postToDelete, setPostToDelete] = useState(null);

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

    const confirmDelete = (postId) => {
        setPostToDelete(postId);
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        setDeleteError('');
        try {
            await userService.deleteUserPost(postToDelete);
            setPosts(posts.filter(post => post.id !== postToDelete));
            setPostToDelete(null);
        } catch (err) {
            console.error("Failed to delete post", err);
            setDeleteError("Failed to delete post. Please try again.");
            setPostToDelete(null);
        }
    };

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
        <div className="max-w-[740px] mx-auto pt-24 pb-8 px-4">
            {/* Profile Header Card */}
            <div className="relative glass-panel rounded-3xl overflow-hidden mb-10 transition-colors duration-300">
                {/* Cover Image Placeholder */}
                <div className="h-40 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 w-full relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="absolute -top-16 left-8">
                        <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5 shadow-2xl border border-white/10">
                            <div className="w-full h-full bg-gradient-to-tr from-accent to-purple-600 rounded-full flex items-center justify-center text-[48px] font-bold text-white shadow-inner">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-20 ml-2">
                        <h1 className="text-[28px] font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
                            {user?.username}
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Premium
                            </span>
                        </h1>
                        <p className="text-slate-300 text-[14px] mb-8 flex flex-wrap gap-6 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {user?.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Member since today
                            </span>
                        </p>

                        <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                            <button
                                onClick={togglePosts}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[14px] transition-all duration-300 cursor-pointer shadow-sm ${showPosts ? 'bg-accent text-white hover:bg-accent-hover shadow-accent/20' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                            >
                                <User className="w-[16px] h-[16px]" />
                                {showPosts ? 'Hide My Posts' : 'Show My Posts'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className={`transition-all duration-500 ease-in-out ${showPosts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
                <h2 className="text-[18px] font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
                    Your Contributions
                </h2>

                {deleteError && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-2">
                        {deleteError}
                    </div>
                )}

                {loadingPosts ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                showDelete={true}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-elevated rounded-[10px] border border-[0.5px] border-border-subtle border-dashed">
                        <p className="text-[14px] font-medium text-text-muted">You haven't posted anything yet.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-panel max-w-sm w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-white/10">
                        <h3 className="text-[20px] font-bold text-white mb-3 tracking-tight">Delete Post</h3>
                        <p className="text-slate-300 text-[14px] leading-relaxed mb-8">
                            Are you sure you want to remove this contribution? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 flex-wrap">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="px-6 py-2.5 rounded-full font-bold text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="px-6 py-2.5 rounded-full font-bold text-[13px] text-white bg-red-500/80 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
