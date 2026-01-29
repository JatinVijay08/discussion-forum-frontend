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
        <div className="max-w-7xl mx-auto pt-24 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 justify-center">
                {/* Main Feed */}
                <div className="w-full lg:w-2/3">
                    {/* Filters */}
                    <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10 mb-6 overflow-x-auto shadow-xs transition-colors duration-300">
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-900/20 text-orange-400 rounded-full font-bold text-sm transition-colors border border-orange-500/20">
                            <Flame className="w-4 h-4" />
                            Hot
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-white/10 rounded-full font-bold text-sm transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            Top
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-white/10 rounded-full font-bold text-sm transition-colors">
                            <Clock className="w-4 h-4" />
                            New
                        </button>
                    </div>

                    {/* Posts */}
                    <div className="space-y-4">
                        {error && <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">{error}</div>}

                        {posts.length === 0 && !error ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
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
                <div className="hidden lg:block w-1/3 space-y-4">
                    {/* Premium Card */}
                    <div className="bg-black/20 p-5 rounded-xl border border-white/10 shadow-sm transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-orange-900/30 rounded-lg">
                                <Star className="w-5 h-5 text-orange-500 fill-current" />
                            </div>
                            <h3 className="font-bold text-white text-base">Forum Premium</h3>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">The best experience, with monthly coins, exclusive features, and more.</p>
                        <button className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-full text-sm transition-all shadow-md shadow-orange-500/20">
                            Try Now
                        </button>
                    </div>

                    {/* Footer Links Style */}
                    <div className="text-xs text-gray-400 dark:text-gray-500 px-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="cursor-pointer hover:underline">About</span>
                            <span className="cursor-pointer hover:underline">Careers</span>
                            <span className="cursor-pointer hover:underline">Press</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="cursor-pointer hover:underline">Terms</span>
                            <span className="cursor-pointer hover:underline">Privacy</span>
                            <span className="cursor-pointer hover:underline">Policy</span>
                        </div>
                        <p className="mt-4">© 2026 Forum Inc. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
