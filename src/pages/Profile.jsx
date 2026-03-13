import React, { useState, useEffect } from 'react';
import { userService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, User, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [showPosts, setShowPosts] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await userService.getCurrentUser();
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
            setError("Failed to load profile.");
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const data = await userService.getUserPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch user posts", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const togglePosts = () => {
        if (!showPosts && posts.length === 0) {
            fetchUserPosts();
        }
        setShowPosts(!showPosts);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await userService.deleteUserPost(postId);
                setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
                console.error("Failed to delete post", err);
                alert("Failed to delete post.");
            }
        }
    };

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-[740px] mx-auto pt-20 pb-8 px-4">
            {/* Profile Header Card */}
            <div className="relative bg-surface rounded-[12px] border-[0.5px] border-border-subtle overflow-hidden mb-8 shadow-none transition-colors duration-300">
                {/* Cover Image Placeholder */}
                <div className="h-32 bg-[rgba(124,58,237,0.1)] w-full relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 rounded-[12px] bg-bg-base p-1 shadow-none border-[0.5px] border-border-subtle">
                            <div className="w-full h-full bg-accent hover:bg-accent-light transition-colors rounded-[8px] flex items-center justify-center text-4xl font-bold text-white uppercase">
                                {user?.username?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-14 ml-2">
                        <h1 className="text-[20px] font-semibold text-text-primary mb-1 flex items-center gap-2">
                            {user?.username}
                            <span className="text-[10px] font-semibold px-2.5 py-[2px] rounded-[20px] bg-[rgba(124,58,237,0.2)] text-accent-light">
                                Member
                            </span>
                        </h1>
                        <p className="text-text-secondary text-[13px] mb-6 flex flex-wrap gap-4">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {user?.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Member since today
                            </span>
                        </p>

                        {/* Stats / Actions */}
                        <div className="flex items-center gap-4 border-t border-[rgba(255,255,255,0.05)] pt-4">
                            <button
                                onClick={togglePosts}
                                className={`flex items-center gap-2 px-4 py-[8px] rounded-[6px] font-medium text-[13px] transition-all duration-300 cursor-pointer ${showPosts ? 'bg-accent text-white hover:bg-accent-light shadow-none' : 'bg-elevated border-[0.5px] border-border-subtle text-text-primary hover:border-[rgba(255,255,255,0.2)]'}`}
                            >
                                <User className="w-[14px] h-[14px]" />
                                {showPosts ? 'Hide My Posts' : 'Show My Posts'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className={`transition-all duration-500 ease-in-out ${showPosts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
                <h2 className="text-[15px] font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <span className="w-1 h-[14px] bg-accent rounded-full"></span>
                    Your Contributions
                </h2>

                {loadingPosts ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                showDelete={true}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-elevated rounded-[10px] border border-[0.5px] border-border-subtle border-dashed">
                        <p className="text-[14px] font-medium text-text-muted">You haven't posted anything yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
