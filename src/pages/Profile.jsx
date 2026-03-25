import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, User, Mail, Calendar, Pencil, Check, X, TrendingUp, Clock, Flame } from 'lucide-react';
import { timeAgo } from '../utils/timeAgo';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user: authUser, login } = useAuth();

    // Profile data
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState('');

    // Posts
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postSort, setPostSort] = useState('new');
    const [postsLoaded, setPostsLoaded] = useState(false);

    // Username editing
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
    const inputRef = useRef(null);

    // Delete post
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    // Success toast
    const [successToast, setSuccessToast] = useState('');

    useEffect(() => { fetchUser(); }, []);

    useEffect(() => {
        if (postsLoaded) {
            fetchUserPosts();
        }
    }, [postSort]);

    const showToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3500);
    };

    const fetchUser = async () => {
        try {
            const data = await userService.getCurrentUser();
            setUser(data);
            setNewUsername(data.username);
            // auto-load posts
            fetchUserPosts();
            setPostsLoaded(true);
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const data = await userService.getUserPosts(postSort);
            setPosts(data);
        } catch (err) {
            console.error('Failed to fetch user posts', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Username update flow
    const startEditing = () => {
        setNewUsername(user.username);
        setUsernameError('');
        setEditingUsername(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const cancelEditing = () => {
        setEditingUsername(false);
        setUsernameError('');
        setNewUsername(user.username);
    };

    const requestUsernameChange = () => {
        const trimmed = newUsername.trim();
        if (!trimmed || trimmed.length < 3) {
            setUsernameError('Username must be at least 3 characters.');
            return;
        }
        if (trimmed === user.username) {
            setEditingUsername(false);
            return;
        }
        setUsernameError('');
        setShowUsernameConfirm(true);
    };

    const confirmUsernameChange = async () => {
        setUsernameLoading(true);
        setShowUsernameConfirm(false);
        try {
            const updated = await userService.updateUsername(newUsername.trim());
            setUser(updated);
            setEditingUsername(false);
            // Also update localStorage username so nav reflects change
            localStorage.setItem('username', updated.username);
            showToast(`Username updated to "${updated.username}" 🎉`);
            setTimeout(() => window.location.reload(), 1200);
        } catch (err) {
            setUsernameError(err?.response?.data?.message || 'Username already taken.');
        } finally {
            setUsernameLoading(false);
        }
    };

    // Delete post flow
    const handleDeletePost = async () => {
        if (!postToDelete) return;
        setDeleteError('');
        try {
            await userService.deleteUserPost(postToDelete);
            setPosts(prev => prev.filter(p => p.id !== postToDelete));
            setPostToDelete(null);
            showToast('Post deleted successfully.');
        } catch (err) {
            setDeleteError('Failed to delete post. Please try again.');
            setPostToDelete(null);
        }
    };

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-400">{error}</div>;
    }

    return (
        <div className="max-w-[740px] mx-auto pt-24 pb-12 px-4">

            {/* Success Toast */}
            {successToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-300 font-semibold text-[13px] rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
                    {successToast}
                </div>
            )}

            {/* Profile Header Card */}
            <div className="relative glass-panel rounded-3xl mb-8">
                {/* Cover */}
                <div className="h-36 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 w-full relative rounded-t-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                </div>

                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="absolute -top-14 left-8">
                        <div className="w-28 h-28 rounded-full bg-slate-900 p-1.5 shadow-2xl border border-white/10">
                            <div className="w-full h-full bg-gradient-to-tr from-accent to-purple-600 rounded-full flex items-center justify-center text-[42px] font-bold text-white">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-18 ml-1" style={{ paddingTop: '72px' }}>
                        {/* Username row */}
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            {editingUsername ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        ref={inputRef}
                                        value={newUsername}
                                        onChange={e => { setNewUsername(e.target.value); setUsernameError(''); }}
                                        onKeyDown={e => { if (e.key === 'Enter') requestUsernameChange(); if (e.key === 'Escape') cancelEditing(); }}
                                        className="bg-white/5 border border-accent/40 text-white rounded-xl px-4 py-1.5 text-[20px] font-bold outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all w-56"
                                        maxLength={30}
                                        placeholder="New username"
                                    />
                                    <button
                                        onClick={requestUsernameChange}
                                        disabled={usernameLoading}
                                        className="p-1.5 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors cursor-pointer"
                                        title="Save"
                                    >
                                        {usernameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors cursor-pointer"
                                        title="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[26px] font-bold text-white tracking-tight">{user?.username}</h1>
                                    <button
                                        onClick={startEditing}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                                        title="Edit username"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {usernameError && (
                            <p className="text-red-400 text-[12px] mb-2 ml-1">{usernameError}</p>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-5 text-slate-400 text-[13px] font-medium mb-1">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                {user?.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                {user?.createdAt ? `Joined ${timeAgo(user.createdAt)}` : 'Member since today'}
                            </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/10">
                            {/* Posts */}
                            <div className="text-center">
                                <p className="text-[22px] font-bold text-white">{posts.length}</p>
                                <p className="text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 text-blue-400/70">
                                    Posts
                                    <span className="relative group cursor-default text-slate-600 text-[10px] border border-slate-700 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none hover:border-slate-500 hover:text-slate-400 transition-colors">
                                        ?
                                        <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-[11px] text-slate-300 leading-relaxed shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-left normal-case tracking-normal">
                                            <div className="absolute top-full left-3 border-4 border-transparent border-t-slate-800" />
                                            <span className="text-blue-400 font-bold">📝 Posts</span> are your voice on the forum. Each one is a discussion you've started — an idea thrown into the void.
                                        </div>
                                    </span>
                                </p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            {/* Karma */}
                            <div className="text-center">
                                <p className="text-[22px] font-bold text-white">
                                    {posts.reduce((acc, p) => acc + (p.voteCount || 0), 0)}
                                </p>
                                <p className="text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 text-amber-400/70">
                                    Karma
                                    <span className="relative group cursor-default text-slate-600 text-[10px] border border-slate-700 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none hover:border-slate-500 hover:text-slate-400 transition-colors">
                                        ?
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-[11px] text-slate-300 leading-relaxed shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-left normal-case tracking-normal">
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                            <span className="text-yellow-400 font-bold">✨ Karma</span> is your vibe score — every upvote you earn adds to it, every downvote chips away. Post well, earn more.
                                        </div>
                                    </span>
                                </p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            {/* Comments */}
                            <div className="text-center">
                                <p className="text-[22px] font-bold text-white">
                                    {posts.reduce((acc, p) => acc + (p.commentCount || 0), 0)}
                                </p>
                                <p className="text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 text-emerald-400/70">
                                    Comments
                                    <span className="relative group cursor-default text-slate-600 text-[10px] border border-slate-700 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none hover:border-slate-500 hover:text-slate-400 transition-colors">
                                        ?
                                        <div className="absolute bottom-full right-0 mb-2 w-52 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-[11px] text-slate-300 leading-relaxed shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-left normal-case tracking-normal">
                                            <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
                                            <span className="text-green-400 font-bold">💬 Comments</span> are the total replies left on your posts. The more debate you spark, the better the idea.
                                        </div>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div>
                {/* Section header + sort tabs */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 className="text-[18px] font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-5 bg-accent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        Your Contributions
                    </h2>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPostSort('new')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${postSort === 'new' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'}`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            New
                        </button>
                        <button
                            onClick={() => setPostSort('top')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${postSort === 'top' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'}`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Top
                        </button>
                    </div>
                </div>

                {deleteError && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[13px] text-red-400 text-center">
                        {deleteError}
                    </div>
                )}

                {loadingPosts ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-7 h-7 animate-spin text-accent" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                showDelete={true}
                                onDelete={(id) => setPostToDelete(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-14 glass-panel rounded-3xl border border-white/5 border-dashed">
                        <User className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                        <p className="text-[15px] font-semibold text-slate-300 mb-1">No posts yet</p>
                        <p className="text-[13px] text-slate-500">Your contributions will appear here.</p>
                    </div>
                )}
            </div>

            {/* Username Confirm Modal */}
            {showUsernameConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-panel max-w-sm w-full p-7 rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[19px] font-bold text-white mb-2 tracking-tight">Change Username?</h3>
                        <p className="text-slate-400 text-[13px] leading-relaxed mb-1">
                            Your username will change from
                        </p>
                        <p className="text-[13px] mb-5">
                            <span className="text-slate-200 font-semibold">"{user?.username}"</span>
                            {' → '}
                            <span className="text-accent font-semibold">"{newUsername.trim()}"</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowUsernameConfirm(false)}
                                className="px-5 py-2 rounded-full text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUsernameChange}
                                className="px-5 py-2 rounded-full text-[13px] font-bold text-white bg-accent hover:bg-blue-600 transition-colors shadow-lg shadow-accent/20 cursor-pointer"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-panel max-w-sm w-full p-7 rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[19px] font-bold text-white mb-2 tracking-tight">Delete Post?</h3>
                        <p className="text-slate-400 text-[13px] leading-relaxed mb-7">
                            This will permanently remove the post and all its votes. This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="px-5 py-2 rounded-full text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="px-5 py-2 rounded-full text-[13px] font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
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
