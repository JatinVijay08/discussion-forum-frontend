import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { timeAgo } from '../utils/timeAgo';

export default function RecentPostsWidget() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await api.get('/posts', { params: { sort: 'new', page: 5 } });
                const data = response.data;
                const postList = Array.isArray(data) ? data : (data.posts || []);
                setPosts(postList.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch recent posts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <div className="card-l2 p-6" style={{ borderRadius: '1.5rem' }}>
            <h3 className="label-meta text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Recent Curations
            </h3>

            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : posts.length === 0 ? (
                <p className="text-[13px] text-on-surface-variant italic">No curations yet.</p>
            ) : (
                <div className="flex flex-col gap-5">
                    {posts.map(post => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/post/${post.id}`)}
                            className="group cursor-pointer"
                        >
                            <h4 className="text-[13px] font-[600] text-on-surface group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </h4>
                            <div className="flex items-center gap-2 label-meta text-[9px] text-outline-variant">
                                <span>{post.username || 'user'}</span>
                                <span>·</span>
                                <span>{timeAgo(post.createdAt || post.createdDate)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => {
                    if (window.location.pathname === '/') window.location.reload();
                    else { navigate('/'); window.scrollTo(0, 0); }
                }}
                className="w-full mt-6 pt-4 flex items-center justify-center gap-2 label-meta text-[10px] text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
                style={{ borderTop: '1px solid rgba(69, 70, 83, 0.15)' }}
            >
                View all curations
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
        </div>
    );
}
