import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import RecentPostsWidget from '../components/RecentPostsWidget';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [cursor, setCursor] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('new');

    const fetchPosts = async (currentCursor = null, isLoadMore = false) => {
        if (!isLoadMore) { setLoading(true); setError(''); }
        else { setLoadingMore(true); }

        try {
            const params = { sort: activeTab, limit: 10 };
            if (activeTab === 'new') {
                if (isLoadMore && currentCursor) params.cursor = currentCursor;
            } else {
                params.page = isLoadMore ? page + 1 : 0;
            }

            const response = await api.get('/posts', { params });
            const data = response.data;

            let fetchedPosts = [];
            let nextCursorResult = null;
            let hasMoreResult = false;

            if (Array.isArray(data)) {
                fetchedPosts = data;
            } else if (data.content) {
                fetchedPosts = data.content;
                hasMoreResult = !data.last;
            } else {
                fetchedPosts = data.posts || [];
                nextCursorResult = data.nextCursor || null;
                hasMoreResult = data.hasMore || false;
            }

            if (isLoadMore) {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    return [...prev, ...fetchedPosts.filter(p => !existingIds.has(p.id))];
                });
            } else {
                setPosts(fetchedPosts);
            }

            if (activeTab !== 'new') {
                if (isLoadMore) setPage(prev => prev + 1);
                else setPage(0);
            }

            setCursor(nextCursorResult);
            setHasMore(hasMoreResult);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            if (!isLoadMore) setPosts([]);
            setError(err.response ? `Failed to load: ${err.response.status}` : err.request ? 'Network Error' : err.message);
            setHasMore(false);
        } finally {
            if (!isLoadMore) setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => { fetchPosts(null, false); }, [activeTab]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            if (activeTab === 'new' && !cursor) return;
            fetchPosts(cursor, true);
        }
    };

    const tabs = [
        { key: 'hot', label: 'Hot', icon: 'local_fire_department' },
        { key: 'trending', label: 'Trending', icon: 'trending_up' },
        { key: 'new', label: 'New', icon: 'schedule' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center min-h-[50vh] gap-4 pt-24">
                <div className="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-primary text-[24px]">diamond</span>
                </div>
                <p className="label-meta text-on-surface-variant">Loading posts...</p>
            </div>
        );
    }

    return (
        <>
            <div className="pt-24 pb-16 px-6 md:px-12 max-w-[80rem] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,680px)_1fr] gap-8 lg:gap-12 w-full">
                    {/* Left Spacers for exact centering */}
                    <div className="hidden lg:block"></div>

                    {/* Main Feed */}
                    <div className="w-full min-w-0">
                        {/* Hero headline */}
                        <div className="mb-12">
                            <h1 className="text-[2.5rem] md:text-[3.5rem] font-[800] tracking-[-0.04em] leading-[0.9] mb-3 gradient-text-animate pb-2">
                                Recent<br />Discussions
                            </h1>
                            <p className="text-[1.125rem] text-on-surface-variant leading-[1.7] max-w-[400px]">
                                Join and start discussions with the community.
                            </p>
                        </div>

                        {/* Sort Tabs and Action */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 w-full border-b border-white/5 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[12px] font-[800] uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer ${
                                            activeTab === tab.key
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high/40'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-[16px] ${activeTab === tab.key ? 'filled pulse-accent' : ''}`}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => window.location.href = '/create'}
                                className="btn-primary btn-pill cta-glow flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-[700] cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Create Post
                            </button>
                        </div>

                        {/* Posts */}
                        <div className="flex flex-col gap-8">
                            {error && (
                                <div className="text-error text-[13px] font-[600] p-4 rounded-xl" style={{ background: 'rgba(255, 180, 171, 0.08)' }}>
                                    {error}
                                </div>
                            )}

                            {posts.length === 0 && !error ? (
                                <div className="card-l2 p-12 text-center flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-[36px] text-outline-variant">forum</span>
                                    <h3 className="text-[1.125rem] font-[700] text-on-surface">No Posts Found</h3>
                                    <p className="text-[0.875rem] text-on-surface-variant">Be the first to start a conversation.</p>
                                </div>
                            ) : (
                                <>
                                    {posts.map(post => (
                                        <PostCard key={`feed-${post.id}`} post={post} />
                                    ))}

                                    {/* Load More */}
                                    <div className="pt-8 flex justify-start">
                                        {hasMore ? (
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="btn-secondary btn-pill flex items-center gap-3 px-8 py-3 text-[13px] disabled:opacity-50 cursor-pointer"
                                            >
                                                {loadingMore ? (
                                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                                )}
                                                {loadingMore ? 'Loading...' : 'Load More'}
                                            </button>
                                        ) : posts.length > 0 ? (
                                            <div className="flex items-center gap-3 px-6 py-3 rounded-full text-[12px] font-[700] text-on-surface-variant uppercase tracking-[0.1em]"
                                                 style={{ background: '#131b2e' }}>
                                                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
                                                All caught up
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block w-full">
                        <div className="w-[300px] sticky top-24 self-start space-y-8">
                        <RecentPostsWidget />

                        {/* Footer */}
                        <div className="label-meta text-outline-variant px-1 space-y-3">
                            <p className="text-[10px] opacity-60">© 2026 Discussion Forum</p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
