import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, commentService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [showComments, setShowComments] = useState(true);
    const [showAddCommentForm, setShowAddCommentForm] = useState(false);

    useEffect(() => {
        fetchPost();
        if (showComments) {
            fetchComments();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const data = await postService.getPostById(id);
            setPost(data);
        } catch (error) {
            console.error("Failed to load post", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            // Assuming page 0, size 50 for now to keep it simple
            const data = await commentService.getCommentsByPostId(id, 0, 50);
            setComments(data.content || []); // data is Page<CommentResponse>, so content is the array
        } catch (error) {
            console.error("Failed to load comments", error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCommentToggle = () => {
        const nextState = !showComments;
        setShowComments(nextState);
        if (nextState && comments.length === 0) {
            fetchComments();
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await commentService.addComment(id, newComment);
            setNewComment('');
            setShowAddCommentForm(false);
            fetchComments(); // Reload comments
            fetchPost(); // Reload post to update comment count if needed
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!post) {
        return <div className="text-center py-10 dark:text-white">Post not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pt-24 pb-6 px-4">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                aria-label="Back to feed"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Feed
            </button>

            {/* Post */}
            <PostCard post={post} isDetail={true} onCommentClick={handleCommentToggle} />

            {/* Comments Section */}
            {showComments && (
                <div className="bg-black/20 rounded-xl border border-white/10 mt-6 p-4 md:p-6 shadow-sm transition-colors duration-300">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="bg-orange-900/30 text-orange-400 text-xs px-2 py-1 rounded-full">{comments.length}</span>
                        Comments
                    </h3>

                    {/* Comment Form */}
                    {user ? (
                        <div className="mb-8">
                            {!showAddCommentForm ? (
                                <button
                                    onClick={() => setShowAddCommentForm(true)}
                                    className="flex items-center gap-2 text-white font-bold bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full transition-colors text-sm cursor-pointer"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Write a Comment
                                </button>
                            ) : (
                                <form onSubmit={handleCommentSubmit} className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <textarea
                                            className="block w-full p-4 border border-white/10 rounded-xl text-white placeholder-zinc-500 bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 focus:bg-black sm:text-sm resize-y min-h-[100px] transition-all cursor-text"
                                            placeholder="What are your thoughts?"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end mt-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddCommentForm(false)}
                                            className="px-4 py-2 rounded-full font-bold text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm text-white transition-all transform hover:-translate-y-0.5 shadow-md ${newComment.trim() ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20 cursor-pointer' : 'bg-zinc-800 cursor-not-allowed'}`}
                                        >
                                            <Send className="w-4 h-4" />
                                            Post
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 p-6 rounded-xl text-center mb-8 border border-white/10 border-dashed">
                            <p className="text-zinc-400 text-sm font-medium mb-3">Log in or sign up to join the discussion</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => navigate('/login')} className="text-white bg-orange-600 hover:bg-orange-700 px-4 py-1.5 rounded-full font-bold text-sm transition-colors">Log In</button>
                                <button onClick={() => navigate('/register')} className="text-orange-400 border border-orange-400 hover:bg-orange-900/10 px-4 py-1.5 rounded-full font-bold text-sm transition-colors">Sign Up</button>
                            </div>
                        </div>
                    )}

                    {/* Comment List */}
                    {loadingComments ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-zinc-400 text-center text-sm py-8 italic">No comments yet. Be the first one!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-zinc-300 text-xs font-bold shrink-0 shadow-inner">
                                            {comment.username ? comment.username[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-white">
                                                    {comment.username || 'User'}
                                                </span>
                                                <span className="text-xs text-zinc-500">{new Date(comment.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-sm text-zinc-300 whitespace-pre-line break-all leading-relaxed bg-zinc-900/50 p-3 rounded-lg rounded-tl-none border border-white/5">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
