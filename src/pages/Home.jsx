import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import RecentPostsWidget from '../components/RecentPostsWidget';
import { TrendingUp, Flame, Clock, Loader2, ArrowDownCircle } from 'lucide-react';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('new'); // default

    const fetchPosts = async (currentCursor = null) => {
        const isLoadMore = currentCursor !== null;
        
        if (!isLoadMore) {
            setLoading(true);
            setError('');
        } else {
            setLoadingMore(true);
        }

        try {
            const params = { sort: activeTab, page: 10 };
            if (currentCursor) params.cursor = currentCursor;

            const response = await api.get('/posts', { params });
            const data = response.data;
            
            let fetchedPosts = [];
            let nextCursorResult = null;
            let hasMoreResult = false;

            // Handle both Page format (for older endpoints) and the cursor pagination format
            if (Array.isArray(data)) {
                fetchedPosts = data;
                hasMoreResult = false; // No more if it just returned raw array
            } else if (data.content) {
                // Spring Data Default Page Format
                fetchedPosts = data.content;
                hasMoreResult = !data.last;
                // Cursor isn't supported in standard page usually, rely on user shape for new endpoints
            } else {
                fetchedPosts = data.posts || [];
                nextCursorResult = data.nextCursor || null;
                hasMoreResult = data.hasMore || false;
            }

            if (isLoadMore) {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewPosts = fetchedPosts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewPosts];
                });
            } else {
                setPosts(fetchedPosts);
            }

            setCursor(nextCursorResult);
            setHasMore(hasMoreResult);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            if (!isLoadMore) setPosts([]);
            const errorMsg = err.response ? `Failed to load posts: ${err.response.status}` : 
                            err.request ? 'Network Error' : err.message;
            setError(errorMsg);
            setHasMore(false);
        } finally {
            if (!isLoadMore) setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(null);
    }, [activeTab]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && cursor) {
            fetchPosts(cursor);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center min-h-[50vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-[13px] text-slate-400 font-medium">Brewing the latest discussions...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto pt-24 pb-10 px-4 flex justify-center w-full">
            <div className="flex gap-4 lg:gap-8 justify-center w-full max-w-[860px]">
                {/* Main Feed */}
                <div className="flex-1 min-w-0">
                    {/* Header Section */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                        <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">The Feed</h1>
                        <p className="text-[14px] text-slate-400">Discover and join ongoing intellectual discourses.</p>
                    </div>

                    {/* Sort Filters Tab */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                         {/* Hot Tab */}
                        <button 
                            onClick={() => setActiveTab('hot')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap border ${activeTab === 'hot' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'}`}
                        >
                            <Flame className={`w-4 h-4 ${activeTab === 'hot' ? 'text-orange-400' : ''}`} />
                            Hot
                        </button>

                        {/* Trending Tab */}
                        <button 
                             onClick={() => setActiveTab('trending')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap border ${activeTab === 'trending' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'}`}
                        >
                            <TrendingUp className={`w-4 h-4 ${activeTab === 'trending' ? 'text-purple-400' : ''}`} />
                            Trending
                        </button>
                        
                        {/* New Tab */}
                        <button 
                             onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap border ${activeTab === 'new' ? 'bg-accent/20 text-accent border-accent/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'}`}
                        >
                            <Clock className={`w-4 h-4 ${activeTab === 'new' ? 'text-accent' : ''}`} />
                            New
                        </button>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        {error && <div className="text-center text-red-400 bg-red-500/10 border border-red-500/20 p-4 font-medium text-[13px] rounded-2xl animate-in fade-in">{error}</div>}

                        {posts.length === 0 && !error ? (
                            <div className="text-center flex flex-col items-center justify-center p-12 glass-panel rounded-3xl border border-white/5 border-dashed">
                                <Clock className="w-10 h-10 text-slate-500 mb-4 opacity-50" />
                                <h3 className="text-[16px] font-bold text-slate-200 mb-2">No Posts Found</h3>
                                <p className="text-[14px] text-slate-400">Be the first to start a conversation natively!</p>
                            </div>
                        ) : (
                            <>
                                {posts.map((post) => (
                                    <PostCard key={`feed-${post.id}`} post={post} />
                                ))}

                                {/* Pagination / Load More */}
                                <div className="pt-6 pb-8 flex justify-center border-t border-white/5 mt-8">
                                    {hasMore ? (
                                        <button 
                                            onClick={handleLoadMore} 
                                            disabled={loadingMore}
                                            className="group flex items-center justify-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all border border-white/10 cursor-pointer disabled:opacity-50 shadow-sm"
                                        >
                                            {loadingMore ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                            ) : (
                                                <>
                                                    <ArrowDownCircle className="w-5 h-5 text-accent group-hover:translate-y-1 transition-transform" />
                                                    Load More Feed
                                                </>
                                            )}
                                        </button>
                                    ) : posts.length > 0 ? (
                                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/5 text-[13px] font-medium text-slate-400 shadow-inner">
                                            <span className="w-2 h-2 rounded-full bg-accent/50 animate-pulse"></span>
                                            You are all caught up!
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-[280px] shrink-0 lg:sticky lg:top-[104px] self-start space-y-6">
                    {/* Add Post Button in Sidebar for convenience */}
                    <button 
                        onClick={() => window.location.href = '/create'}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
                    >
                        + Create Discussion
                    </button>
                    
                    {/* Replaced Discourse Panel with the requested Recent Posts Widget */}
                    <RecentPostsWidget />

                    {/* Footer Links Style */}
                    <div className="text-[12px] text-slate-500 mt-6 px-1">
                        <div className="flex flex-wrap gap-4 font-medium mb-4">
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">About</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Careers</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Terms</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Privacy</span>
                        </div>
                        <p className="text-[11px] opacity-75 uppercase tracking-wider">© 2026 Pure Discourse Platform</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
