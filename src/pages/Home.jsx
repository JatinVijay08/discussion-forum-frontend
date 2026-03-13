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
                    <div className="flex items-center gap-4 mb-4 overflow-x-auto">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(16,185,129,0.15)] text-accent-green rounded-[4px] font-medium text-[12px] transition-colors">
                            <Flame className="w-3.5 h-3.5" />
                            Hot
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary rounded-[4px] font-medium text-[12px] transition-colors">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Top
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary rounded-[4px] font-medium text-[12px] transition-colors">
                            <Clock className="w-3.5 h-3.5" />
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
                <div className="hidden lg:block w-[220px] shrink-0">
                    {/* Widget */}
                    <div className="bg-surface p-[14px] rounded-[10px] border-[0.5px] border-border-subtle transition-colors duration-300">
                        <h3 className="font-semibold text-text-primary text-[12px] mb-[10px]">
                            Community Info
                        </h3>
                        
                        <div className="flex justify-between items-center text-[12px] text-text-secondary py-[12px] border-t border-[rgba(255,255,255,0.05)]">
                            <span>Members</span>
                            <span className="text-accent-light">14.2k</span>
                        </div>
                        <div className="flex justify-between items-center text-[12px] text-text-secondary py-[12px] border-t border-[rgba(255,255,255,0.05)]">
                            <span>Online</span>
                            <span className="text-accent-light flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
                                245
                            </span>
                        </div>
                        
                        <button onClick={() => window.location.href = '/create'} className="w-full mt-[10px] py-[8px] bg-accent hover:bg-accent-light text-white font-medium rounded-[6px] text-[13px] transition-all cursor-pointer">
                            New Post
                        </button>
                    </div>

                    {/* Footer Links Style */}
                    <div className="text-[11px] text-text-muted px-2 mt-4 space-y-1.5">
                        <div className="flex flex-wrap gap-2">
                            <span className="cursor-pointer hover:underline hover:text-text-primary">About</span>
                            <span className="cursor-pointer hover:underline hover:text-text-primary">Careers</span>
                            <span className="cursor-pointer hover:underline hover:text-text-primary">Press</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="cursor-pointer hover:underline hover:text-text-primary">Terms</span>
                            <span className="cursor-pointer hover:underline hover:text-text-primary">Privacy</span>
                            <span className="cursor-pointer hover:underline hover:text-text-primary">Policy</span>
                        </div>
                        <p className="mt-2 text-[10px]">© 2026 Nexus Inc. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
