import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { timeAgo } from '../utils/timeAgo';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function RecentPostsWidget() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                // Same endpoint as feed, page 5 acts as limit
                const response = await api.get('/posts', {
                    params: { sort: 'new', page: 5 }
                });
                
                // Assuming backend might return an array OR the new cursor object shape
                const data = response.data;
                const postList = Array.isArray(data) ? data : (data.posts || []);
                setPosts(postList.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch recent posts for widget:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    return (
        <div className="glass-panel p-5 rounded-2xl mb-6 transition-colors duration-300 shadow-sm border border-white/5">
            <h3 className="font-bold text-white text-[15px] mb-4 tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                RECENT DISCUSSIONS
            </h3>
            
            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : posts.length === 0 ? (
                <p className="text-[13px] text-slate-400 italic">No recent posts found.</p>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div 
                            key={post.id} 
                            onClick={() => navigate(`/post/${post.id}`)}
                            className="group cursor-pointer"
                        >
                            <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <span className="text-slate-400">u/{post.username || 'user'}</span>
                                <span>•</span>
                                <span>{timeAgo(post.createdAt || post.createdDate)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <button 
                onClick={() => {
                    if (window.location.pathname === '/') {
                        window.location.reload(); // Enforces remounting to reset state down to 'new' if already on feed
                    } else {
                        navigate('/');
                        window.scrollTo(0, 0);
                    }
                }}
                className="w-full mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[12px] font-bold text-slate-400 hover:text-white transition-colors group cursor-pointer"
            >
                View more new posts <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
