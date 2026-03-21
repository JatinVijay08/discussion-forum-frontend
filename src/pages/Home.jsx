import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { TrendingUp, Flame, Clock, Star, Loader2 } from 'lucide-react';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setPosts([]);
            if (err.response) {
                setError(`Failed to load posts: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                setError('Failed to load posts: Network Error (Check backend URL or CORS)');
            } else {
                setError(`Failed to load posts: ${err.message}`);
            }
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto pt-20 pb-6 px-4 flex justify-center w-full">
            <div className="flex gap-3 justify-center w-full max-w-[860px]">
                {/* Main Feed */}
                <div className="flex-1 min-w-0">
                    {/* Filters */}
                    <div className="flex items-center gap-3 mb-6 overflow-x-auto">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full font-semibold text-[13px] border border-white/20 transition-all hover:bg-white/20 cursor-pointer shadow-sm">
                            <Flame className="w-4 h-4 text-orange-400" />
                            Hot
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent font-medium text-[13px] transition-all cursor-pointer">
                            <TrendingUp className="w-4 h-4" />
                            Trending
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent font-medium text-[13px] transition-all cursor-pointer">
                            <Clock className="w-4 h-4" />
                            New
                        </button>
                    </div>

                    {/* Posts */}
                    <div className="space-y-3">
                        {error && <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-[12px]">{error}</div>}

                        {posts.length === 0 && !error ? (
                            <div className="text-center text-text-muted py-10">
                                No posts found. Be the first to create one!
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar (Desktop only) */}
                <div className="hidden lg:block w-[260px] shrink-0 lg:sticky lg:top-[88px] self-start">
                    {/* Widget */}
                    <div className="glass-panel p-5 rounded-2xl mb-6 transition-colors duration-300">
                        <h3 className="font-bold text-white text-[16px] mb-2 tracking-wide">
                            PURE DISCOURSE
                        </h3>
                        <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">
                            Join the world's most refined social collective. Minimalist design, maximalist impact.
                        </p>
                        
                        <div className="flex justify-between items-center text-[13px] text-slate-300 py-3 border-t border-white/10">
                            <span className="font-medium">Members</span>
                            <span className="text-white font-bold">14.2k</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px] text-slate-300 py-3 border-t border-white/10">
                            <span className="font-medium">Online</span>
                            <span className="text-white font-bold flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                245
                            </span>
                        </div>
                        
                        <button onClick={() => window.location.href = '/create'} className="w-full mt-3 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-[14px] shadow-lg shadow-accent/20 transition-all cursor-pointer">
                            Create Community
                        </button>
                    </div>

                    {/* Footer Links Style */}
                    {/* Footer Links Style */}
                    <div className="text-[12px] text-slate-500 px-2 mt-4 space-y-2">
                        <div className="flex flex-wrap gap-4 font-medium">
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">About GlassForum</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Careers</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Terms</span>
                            <span className="cursor-pointer hover:underline hover:text-slate-300 transition-colors">Privacy</span>
                        </div>
                        <p className="mt-4 text-[11px] opacity-75 uppercase tracking-wider">© 2024 GlassForum. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
