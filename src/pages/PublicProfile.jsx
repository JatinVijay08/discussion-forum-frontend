import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../api/services';
import PostCard from '../components/PostCard';
import { timeAgo } from '../utils/timeAgo';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PublicProfile() {
    const { username } = useParams();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState('');

    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postSort, setPostSort] = useState('new');
    const [postsLoaded, setPostsLoaded] = useState(false);

    useEffect(() => {
        if (authUser?.username === username) {
            navigate('/profile', { replace: true });
        }
    }, [authUser, username, navigate]);

    useEffect(() => { fetchUser(); }, [username]);
    useEffect(() => { if (postsLoaded) fetchUserPosts(); }, [postSort, username, postsLoaded]);

    const fetchUser = async () => {
        setLoadingUser(true);
        setError('');
        try {
            const data = await userService.getUserProfile(username);
            setUser(data);
            setPostsLoaded(true);
        } catch (err) { setError('Failed to load profile.'); }
        finally { setLoadingUser(false); }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try { setPosts(await userService.getUserProfilePosts(username, postSort)); }
        catch (err) { console.error('Failed to fetch user posts', err); }
        finally { setLoadingPosts(false); }
    };

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
            {/* Profile Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex flex-col gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <h1 className="text-[2.5rem] md:text-[3.5rem] font-[800] tracking-[-0.04em] leading-[1.0] text-white break-all sm:break-words">
                                {user?.username}
                            </h1>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-6 text-on-surface-variant text-[14px] font-[500]">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-low/50">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                {user?.createdAt ? `Joined ${timeAgo(user.createdAt)}` : 'Member since'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 w-full max-w-[480px]">
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-on-surface mb-1">{user?.postCount || 0}</p>
                    <p className="label-meta text-[9px] text-primary flex items-center justify-center gap-1">Posts</p>
                </div>
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-tertiary-gold mb-1 pulse-accent">{user?.karma || 0}</p>
                    <p className="label-meta text-[9px] text-tertiary-gold flex items-center justify-center gap-1">Karma</p>
                </div>
                <div className="card-l2 p-3 sm:p-5 text-center flex flex-col justify-center" style={{ borderRadius: '1.5rem' }}>
                    <p className="text-[1.25rem] sm:text-[1.5rem] font-[800] text-on-surface mb-1">{user?.commentCount || 0}</p>
                    <p className="label-meta text-[9px] text-primary-container flex items-center justify-center gap-1">Comments</p>
                </div>
            </div>

            {/* Posts Section */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="text-[1.25rem] font-[700] text-on-surface flex items-center gap-3">
                        <span className="w-1 h-5 rounded-full bg-primary"></span>
                        {user?.username}'s Posts
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

                {loadingPosts ? (
                    <div className="flex justify-center py-16">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="flex flex-col gap-8">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="card-l2 p-12 text-center flex flex-col items-center gap-4" style={{ borderRadius: '1.5rem' }}>
                        <span className="material-symbols-outlined text-[36px] text-outline-variant">person</span>
                        <h3 className="text-[1.125rem] font-[700] text-on-surface">No posts yet</h3>
                        <p className="text-[14px] text-on-surface-variant">This user hasn't posted anything.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
