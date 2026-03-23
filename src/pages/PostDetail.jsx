import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, commentService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft, Send, MessageSquare, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [showComments, setShowComments] = useState(true);
    const [showAddCommentForm, setShowAddCommentForm] = useState(false);

    useEffect(() => {
        fetchPost();
        if (showComments) {
            fetchComments(0);
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

    const fetchComments = async (page = currentPage) => {
        try {
            setLoadingComments(true);
            const data = await commentService.getCommentsByPostId(id, page, 50); // Increased size to fetch more for nesting

            // Build the comment tree
            const flatComments = data.content || [];
            const commentMap = {};
            const rootComments = [];

            // First pass: create map
            flatComments.forEach(comment => {
                comment.replies = [];
                commentMap[comment.id] = comment;
            });

            // Second pass: link children to parents
            flatComments.forEach(comment => {
                // If parentComment is a valid ID (not null, 'null', or 0), it's a reply
                if (comment.parentComment && comment.parentComment !== 'null' && comment.parentComment !== 0) {
                    const parent = commentMap[comment.parentComment];
                    if (parent) {
                        parent.replies.push(comment);
                    } else {
                        // Orphaned reply, treat as root for now or ignore
                        rootComments.push(comment);
                    }
                } else {
                    // No valid parentComment -> root comment
                    rootComments.push(comment);
                }
            });

            setComments(rootComments);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number || page);
        } catch (error) {
            console.error("Failed to load comments", error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchComments(newPage);
        }
    };

    const handleCommentToggle = () => {
        const nextState = !showComments;
        setShowComments(nextState);
        if (nextState && comments.length === 0) {
            fetchComments(0);
        }
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        e?.preventDefault(); // e is optional for replies
        const content = parentId ? newComment : newComment; // Reuse state for main input, but replies usually have own form. 
        // Wait, for specific replies we need specific input. 
        // Let's refactor: main form uses newComment. Reply forms will use their own local state.

        if (!content.trim()) return;

        try {
            await commentService.addComment(id, content, parentId);
            setNewComment('');
            setReplyingTo(null);
            fetchComments(0);
            fetchPost();
        } catch (error) {
            // Handled globally
        }
    };

    // Recursive Component for rendering comments
    const CommentItem = ({ comment, depth = 0 }) => {
        const [replyContent, setReplyContent] = useState('');
        const isReplying = replyingTo === comment.id;

        const submitReply = async (e) => {
            e.preventDefault();
            if (!replyContent.trim()) return;
            try {
                await commentService.addComment(id, replyContent, comment.id);
                setReplyContent('');
                setReplyingTo(null);
                fetchComments(0); // Refresh tree
            } catch (error) {
                // Handled globally
            }
        };

        const [localComment, setLocalComment] = useState(comment);
        const [isCollapsed, setIsCollapsed] = useState(false);

        useEffect(() => {
            setLocalComment(comment);
        }, [comment]);

        const handleVote = async (e, type) => {
            e.stopPropagation();
            try {
                const updatedComment = await commentService.voteOnComment(localComment.id, type);
                let newVoteType = updatedComment.voteType;
                if (newVoteType === 'null' || newVoteType === undefined) {
                    newVoteType = null;
                }

                setLocalComment(prev => ({
                    ...prev,
                    ...updatedComment,
                    voteType: newVoteType,
                    voteCount: updatedComment.voteCount ?? prev.voteCount,
                    // keep replies intact since voteOnComment won't return nested replies
                    replies: prev.replies,
                    // CRITICAL FIX: The voteOnComment endpoint might incorrectly return the logged-in user's username.
                    // To prevent the comment author from visually changing to the logged-in user, we explicitly
                    // retain the original comment username.
                    username: prev.username
                }));
            } catch (error) {
                console.error("Vote failed", error);
            }
        };

        return (
            <div className={`flex flex-col gap-3 group relative ${depth > 0 ? 'ml-4 border-l-2 border-[rgba(124,58,237,0.2)] pl-4' : ''}`}>
                {depth > 0 && localComment.replies?.length > 0 && (
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -left-[9px] top-8 w-4 h-4 bg-slate-900 border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-accent z-10 transition-colors cursor-pointer"
                    >
                        {isCollapsed ? '+' : '-'}
                    </button>
                )}
                
                {isCollapsed ? (
                    <div className="flex gap-2 items-center py-2 cursor-pointer bg-white/5 px-4 rounded-xl border border-white/5 w-max hover:bg-white/10 transition-colors" onClick={() => setIsCollapsed(false)}>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-inner">
                            {localComment.username ? localComment.username[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
                            u/{localComment.username} · {localComment.replies?.length || 0} child comments
                        </span>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {/* Vote Column for Comment */}
                        <div className="flex flex-col items-center pt-1 min-w-[32px] w-[32px] shrink-0">
                            <button
                                onClick={(e) => handleVote(e, 'upvote')}
                                className={`w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 ${localComment.voteType === 'upvote' ? 'text-accent bg-accent/20' : 'text-text-muted hover:text-accent hover:bg-accent/10'}`}
                            >
                                <ArrowBigUp className={`w-4 h-4 ${localComment.voteType === 'upvote' ? 'fill-current' : ''}`} />
                            </button>
                            <span className={`text-[12px] font-semibold my-1 transition-colors ${localComment.voteType === 'upvote' ? 'text-accent' : localComment.voteType === 'downvote' ? 'text-orange-500' : 'text-text-primary'}`}>
                                {localComment.voteCount || 0}
                            </span>
                            <button
                                onClick={(e) => handleVote(e, 'downvote')}
                                className={`w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 ${localComment.voteType === 'downvote' ? 'text-orange-500 bg-orange-500/20' : 'text-text-muted hover:text-orange-500 hover:bg-orange-500/10'}`}
                            >
                                <ArrowBigDown className={`w-4 h-4 ${localComment.voteType === 'downvote' ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 text-[12px] text-slate-400 flex-wrap">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center text-white text-[9px] font-bold shadow-inner">
                                    {localComment.username ? localComment.username[0].toUpperCase() : 'U'}
                                </div>
                                <span className="font-bold text-slate-200">
                                    u/{localComment.username || 'User'}
                                </span>
                                <span>• {timeAgo(localComment.createdAt || localComment.createdDate)}</span>
                            </div>
                            <div className="text-[14px] text-slate-300 whitespace-pre-line break-all leading-[1.6] py-2 glass-panel rounded-2xl px-4 shadow-sm">
                                {localComment.content}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center mt-2">
                                {user && (
                                    <button
                                        onClick={() => setReplyingTo(isReplying ? null : localComment.id)}
                                        className="text-[11px] font-medium text-accent-light hover:text-accent transition-colors flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Reply
                                    </button>
                                )}
                            </div>

                            {/* Reply Form */}
                            {isReplying && (
                                <form onSubmit={submitReply} className="mt-3">
                                    <textarea
                                        className="block w-full p-4 glass-input rounded-2xl text-[14px] leading-relaxed min-h-[80px] resize-y transition-all shadow-inner"
                                        placeholder={`Replying to ${localComment.username}...`}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end mt-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="px-4 py-2 rounded-full text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!replyContent.trim()}
                                            className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-full text-[13px] font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-accent/20"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Render Replies Recursively */}
                {!isCollapsed && localComment.replies?.length > 0 && (
                    <div className="flex flex-col gap-4 mt-1">
                        {localComment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
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
        <div className="max-w-[740px] mx-auto pt-24 pb-6 px-4">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full mb-6 transition-all w-max border border-white/10 cursor-pointer shadow-sm"
                aria-label="Back to feed"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[13px] font-bold tracking-wide">Back to Feed</span>
            </button>

            {/* Post */}
            <PostCard post={post} isDetail={true} onCommentClick={handleCommentToggle} />

            {/* Comments Section */}
            {showComments && (
                <div className="w-full mt-8">
                    <h3 className="text-[16px] font-bold text-white mb-6 flex items-center gap-3">
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] px-3 py-1 rounded-full font-bold shadow-sm">{post.totalCommentCount ?? post.commentCount ?? comments.length}</span>
                        Discussion
                    </h3>

                    {/* Comment Form */}
                    {user ? (
                        <div className="mb-10">
                            {!showAddCommentForm ? (
                                <button
                                    onClick={() => setShowAddCommentForm(true)}
                                    className="w-full flex items-center justify-between glass-panel hover:bg-white/10 text-slate-300 hover:text-white px-6 py-4 rounded-2xl transition-all text-[14px] font-medium cursor-pointer shadow-sm group"
                                >
                                    <span className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-accent group-hover:text-accent-hover transition-colors" />
                                        Share your thoughts...
                                    </span>
                                </button>
                            ) : (
                                <form onSubmit={handleCommentSubmit} className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <textarea
                                            className="block w-full p-4 glass-input rounded-2xl text-[14px] leading-relaxed min-h-[120px] resize-y transition-all shadow-inner"
                                            placeholder="What are your thoughts?"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end mt-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddCommentForm(false)}
                                            className="px-5 py-2 rounded-full font-bold text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-[13px] text-white transition-all shadow-lg ${newComment.trim() ? 'bg-accent hover:bg-accent-hover shadow-accent/20 cursor-pointer' : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed shadow-none'}`}
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Publish
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel p-8 rounded-2xl text-center mb-10 flex flex-col items-center">
                            <h4 className="text-white text-[16px] font-bold mb-2">Join the Discussion</h4>
                            <p className="text-slate-400 text-[13px] mb-6 max-w-sm">Log in or sign up to leave a comment, vote, and become part of the community.</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate('/login')} className="text-white bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2.5 rounded-full font-bold text-[13px] transition-colors cursor-pointer shadow-sm">Log In</button>
                                <button onClick={() => navigate('/register')} className="text-white bg-accent hover:bg-accent-hover px-6 py-2.5 rounded-full font-bold text-[13px] transition-colors cursor-pointer shadow-lg shadow-accent/20">Sign Up</button>
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
                                <>
                                    {comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}

                                     {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-border-subtle">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="px-3 py-1.5 text-[13px] font-medium rounded-md text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-subtle hover:text-text-main transition-colors cursor-pointer"
                                            >
                                                Previous
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, index) => {
                                                    if (
                                                        index === 0 ||
                                                        index === totalPages - 1 ||
                                                        (index >= currentPage - 1 && index <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => handlePageChange(index)}
                                                                className={`min-w-[32px] h-[32px] flex items-center justify-center text-[13px] font-medium rounded-md transition-all cursor-pointer ${currentPage === index
                                                                    ? 'bg-accent/10 border border-accent text-accent'
                                                                    : 'text-text-muted hover:bg-border-subtle hover:text-text-main'
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        );
                                                    } else if (
                                                        index === currentPage - 2 ||
                                                        index === currentPage + 2
                                                    ) {
                                                        return <span key={index} className="text-text-muted text-[13px] self-end pb-1 px-1">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                                className="px-3 py-1.5 text-[13px] font-medium rounded-md text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-subtle hover:text-text-main transition-colors cursor-pointer"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
