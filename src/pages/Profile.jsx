import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../api/services';
import PostCard from '../components/PostCard';
import { timeAgo } from '../utils/timeAgo';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user: authUser, login } = useAuth();

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState('');

    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postSort, setPostSort] = useState('new');
    const [postsLoaded, setPostsLoaded] = useState(false);

    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
    const inputRef = useRef(null);

    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [successToast, setSuccessToast] = useState('');

    useEffect(() => { fetchUser(); }, []);
    useEffect(() => { if (postsLoaded) fetchUserPosts(); }, [postSort]);

    const showToast = (msg) => { setSuccessToast(msg); setTimeout(() => setSuccessToast(''), 3500); };

    const fetchUser = async () => {
        try {
            const data = await userService.getCurrentUser();
            setUser(data);
            setNewUsername(data.username || authUser?.username || '');
            fetchUserPosts();
            setPostsLoaded(true);
        } catch (err) { setError('Failed to load profile.'); }
        finally { setLoadingUser(false); }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try { setPosts(await userService.getUserPosts(postSort)); }
        catch (err) { console.error('Failed to fetch user posts', err); }
        finally { setLoadingPosts(false); }
    };

    const startEditing = () => { setNewUsername(user.username); setUsernameError(''); setEditingUsername(true); setTimeout(() => inputRef.current?.focus(), 50); };
    const cancelEditing = () => { setEditingUsername(false); setUsernameError(''); setNewUsername(user.username); };

    const requestUsernameChange = () => {
        const trimmed = newUsername.trim();
        if (!trimmed || trimmed.length < 3) { setUsernameError('Username must be at least 3 characters.'); return; }
        if (trimmed === user.username) { setEditingUsername(false); return; }
        setUsernameError(''); setShowUsernameConfirm(true);
    };

    const confirmUsernameChange = async () => {
        setUsernameLoading(true); setShowUsernameConfirm(false);
        try {
            const updated = await userService.updateUsername(newUsername.trim());
            setUser(updated); setEditingUsername(false);
            localStorage.setItem('username', updated.username);
            showToast(`Username updated to "${updated.username}"`);
            setTimeout(() => window.location.reload(), 1200);
        } catch (err) { setUsernameError(err?.response?.data?.message || 'Username already taken.'); }
        finally { setUsernameLoading(false); }
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        setDeleteError('');
        try { await userService.deleteUserPost(postToDelete); setPosts(prev => prev.filter(p => p.id !== postToDelete)); setPostToDelete(null); showToast('Post removed.'); }
        catch (err) { setDeleteError('Failed to delete post.'); setPostToDelete(null); }
    };

    // Stats are now fetched from backend via UserProfileResponse

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] pt-24">
                <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">diamond</span>
            </div>
        );
    }

    if (error) return <div className="text-center py-16 text-error pt-24">{error}</div>;

    return (
        <div className="max-w-[900px] mx-auto pt-24 pb-16 px-6 md:px-10">
            {/* Success Toast */}
            {successToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-[13px] font-[700] text-primary glass ghost-border">
                    {successToast}
                </div>
            )}

            {/* Profile Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex flex-col gap-6">
                    <div className="flex-1 min-w-0">
                        {/* Username */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            {editingUsername ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        ref={inputRef}
                                        value={newUsername}
                                        onChange={e => { setNewUsername(e.target.value); setUsernameError(''); }}
                                        onKeyDown={e => { if (e.key === 'Enter') requestUsernameChange(); if (e.key === 'Escape') cancelEditing(); }}
                                        className="obsidian-input px-4 py-2 text-[1.5rem] font-[700] w-64"
                                        style={{ borderRadius: '0.75rem' }}
                                        maxLength={30}
                                        placeholder="New username"
                                    />
                                    <button onClick={requestUsernameChange} disabled={usernameLoading}
                                        className="w-10 h-10 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary flex items-center justify-center transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[18px]">{usernameLoading ? 'progress_activity' : 'check'}</span>
                                    </button>
                                    <button onClick={cancelEditing}
                                        className="w-10 h-10 rounded-xl bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-[800] tracking-[-0.04em] leading-[1.0] text-white break-all sm:break-words">
                                        {user?.username || authUser?.username || 'User'}
                                    </h1>
                                    <button onClick={startEditing}
                                        className="p-2.5 rounded-xl hover:bg-surface-high/40 text-on-surface-variant hover:text-white transition-colors cursor-pointer shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {usernameError && <p className="text-error text-[12px] mb-4 font-[600]">{usernameError}</p>}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-6 text-on-surface-variant text-[14px] font-[500]">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-low/50">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                {user?.email}
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-low/50">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                {user?.createdAt ? `Joined ${timeAgo(user.createdAt)}` : 'Member since today'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 w-full max-w-[480px]">
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-on-surface mb-1">{user?.postCount || 0}</p>
                    <p className="label-meta text-[9px] text-primary flex items-center justify-center gap-1">
                        Posts
                        <span className="relative group cursor-default">
                            <span className="text-outline-variant text-[9px] ghost-border rounded-full w-3 h-3 flex items-center justify-center font-[800] leading-none hover:text-on-surface-variant transition-colors">?</span>
                            <span className="absolute bottom-full left-0 mb-2 w-48 px-3 py-2 rounded-xl text-[10px] text-on-surface-variant leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left normal-case tracking-normal" style={{ background: '#2d3449', boxShadow: '0 20px 50px rgba(13, 15, 38, 0.6)' }}>
                                <span className="text-primary font-[700]">Posts</span> — Discussions you've started.
                            </span>
                        </span>
                    </p>
                </div>
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-tertiary-gold mb-1 pulse-accent">{user?.karma || 0}</p>
                    <p className="label-meta text-[9px] text-tertiary-gold flex items-center justify-center gap-1">
                        Karma
                        <span className="relative group cursor-default">
                            <span className="text-outline-variant text-[9px] ghost-border rounded-full w-3 h-3 flex items-center justify-center font-[800] leading-none hover:text-on-surface-variant transition-colors">?</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 rounded-xl text-[10px] text-on-surface-variant leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left normal-case tracking-normal" style={{ background: '#2d3449', boxShadow: '0 20px 50px rgba(13, 15, 38, 0.6)' }}>
                                <span className="text-tertiary-gold font-[700]">Karma</span> — Your reputation score. Upvotes add, downvotes subtract.
                            </span>
                        </span>
                    </p>
                </div>
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-on-surface mb-1">{user?.commentCount || 0}</p>
                    <p className="label-meta text-[9px] text-primary-container flex items-center justify-center gap-1">
                        Comments
                        <span className="relative group cursor-default">
                            <span className="text-outline-variant text-[9px] ghost-border rounded-full w-3 h-3 flex items-center justify-center font-[800] leading-none hover:text-on-surface-variant transition-colors">?</span>
                            <span className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 rounded-xl text-[10px] text-on-surface-variant leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left normal-case tracking-normal" style={{ background: '#2d3449', boxShadow: '0 20px 50px rgba(13, 15, 38, 0.6)' }}>
                                <span className="text-primary-container font-[700]">Comments</span> — Replies across your posts.
                            </span>
                        </span>
                    </p>
                </div>
            </div>

            {/* Posts Section */}
            <div className="mt-12">
                    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                        <h2 className="text-[1.25rem] font-[700] text-on-surface flex items-center gap-3">
                            <span className="w-1 h-5 rounded-full bg-primary"></span>
                            Your Posts
                        </h2>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setPostSort('new')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-[800] uppercase tracking-[0.1em] transition-all cursor-pointer ${postSort === 'new' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high/40'}`}>
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                New
                            </button>
                            <button onClick={() => setPostSort('top')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-[800] uppercase tracking-[0.1em] transition-all cursor-pointer ${postSort === 'top' ? 'bg-tertiary-gold/10 text-tertiary-gold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high/40'}`}>
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                Top
                            </button>
                        </div>
                    </div>

                    {deleteError && (
                        <div className="mb-5 p-3 rounded-xl text-[13px] font-[600] text-error" style={{ background: 'rgba(255, 180, 171, 0.08)' }}>
                            {deleteError}
                        </div>
                    )}

                    {loadingPosts ? (
                        <div className="flex justify-center py-16">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} showDelete={true} onDelete={(id) => setPostToDelete(id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="card-l2 p-12 text-center flex flex-col items-center gap-4" style={{ borderRadius: '1.5rem' }}>
                            <span className="material-symbols-outlined text-[36px] text-outline-variant">person</span>
                            <h3 className="text-[1.125rem] font-[700] text-on-surface">No posts yet</h3>
                            <p className="text-[14px] text-on-surface-variant">Your contributions will appear here.</p>
                        </div>
                    )}
            </div>

            {/* Username Confirm Modal */}
            {showUsernameConfirm && (
                <div className="fixed inset-0 z-50 flex items-center p-4 atelier-overlay" style={{ justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20vh' }}>
                    <div className="atelier-panel max-w-sm w-full p-7" style={{ borderRadius: '1.5rem' }}>
                        <h3 className="text-[1.25rem] font-[700] text-on-surface tracking-tight mb-2">Change Username?</h3>
                        <p className="text-on-surface-variant text-[13px] leading-[1.7] mb-1">Your username will change from</p>
                        <p className="text-[13px] mb-6">
                            <span className="text-on-surface font-[600]">"{user?.username || authUser?.username}"</span>
                            {' → '}
                            <span className="text-primary font-[600]">"{newUsername.trim()}"</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowUsernameConfirm(false)}
                                className="btn-ghost px-5 py-2.5 text-[13px] font-[700] cursor-pointer" style={{ borderRadius: '0.5rem' }}>Cancel</button>
                            <button onClick={confirmUsernameChange}
                                className="btn-primary btn-pill px-5 py-2.5 text-[13px] cursor-pointer">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center p-4 atelier-overlay" style={{ justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20vh' }}>
                    <div className="atelier-panel max-w-sm w-full p-7" style={{ borderRadius: '1.5rem' }}>
                        <h3 className="text-[1.25rem] font-[700] text-on-surface tracking-tight mb-2">Remove Post?</h3>
                        <p className="text-on-surface-variant text-[13px] leading-[1.7] mb-7">
                            This will permanently remove the post and all its votes. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setPostToDelete(null)}
                                className="btn-ghost px-5 py-2.5 text-[13px] font-[700] cursor-pointer" style={{ borderRadius: '0.5rem' }}>Cancel</button>
                            <button onClick={handleDeletePost}
                                className="px-5 py-2.5 text-[13px] font-[800] text-canvas cursor-pointer"
                                style={{ borderRadius: '9999px', background: 'linear-gradient(to right, #ff8a80, #ffb4ab)' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
