import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, commentService } from '../api/services';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft, Send, MessageSquare, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
            console.error("Failed to add comment", error);
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
                console.error("Failed to post reply", error);
            }
        };

        const [localComment, setLocalComment] = useState(comment);
        const [isCollapsed, setIsCollapsed] = useState(false);

        useEffect(() => {
            setLocalComment(comment);
        }, [comment]);

        const handleVote = async (e, type) => {
            e.stopPropagation();
            if (!user) {
                navigate('/login');
                return;
            }
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
                        className="absolute -left-[9px] top-8 w-4 h-4 bg-bg-base border-[0.5px] border-border-subtle rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-active z-10 transition-colors"
                    >
                        {isCollapsed ? '+' : '-'}
                    </button>
                )}
                
                {isCollapsed ? (
                    <div className="flex gap-2 items-center py-1 cursor-pointer" onClick={() => setIsCollapsed(false)}>
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold">
                            {localComment.username ? localComment.username[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors">
                            u/{localComment.username} · {localComment.replies?.length || 0} child comments
                        </span>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {/* Vote Column for Comment */}
                        <div className="flex flex-col items-center pt-1 min-w-[32px] w-[32px] shrink-0">
                            <button
                                onClick={(e) => handleVote(e, 'upvote')}
                                className={`w-6 h-6 flex items-center justify-center rounded-[4px] upvote-bounce cursor-pointer ${localComment.voteType === 'upvote' ? 'bg-accent text-white' : 'bg-elevated text-text-muted hover:text-accent'}`}
                            >
                                <ArrowBigUp className={`w-4 h-4 ${localComment.voteType === 'upvote' ? 'fill-current' : ''}`} />
                            </button>
                            <span className={`text-[12px] font-semibold my-1 ${localComment.voteType === 'upvote' ? 'text-accent-light' : localComment.voteType === 'downvote' ? 'text-text-muted' : 'text-accent-light'}`}>
                                {localComment.voteCount || 0}
                            </span>
                            <button
                                onClick={(e) => handleVote(e, 'downvote')}
                                className={`w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer ${localComment.voteType === 'downvote' ? 'bg-elevated text-accent' : 'bg-elevated text-text-muted hover:text-accent-light'}`}
                            >
                                <ArrowBigDown className={`w-4 h-4 ${localComment.voteType === 'downvote' ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-text-muted flex-wrap">
                                <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white text-[8px] font-bold">
                                    {localComment.username ? localComment.username[0].toUpperCase() : 'U'}
                                </div>
                                <span className="font-medium text-text-primary">
                                    u/{localComment.username || 'User'}
                                </span>
                                <span>• {new Date(localComment.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[14px] text-text-secondary whitespace-pre-line break-all leading-[1.4] py-1 bg-elevated border-[0.5px] border-border-subtle rounded-[8px] p-[10px]">
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
                                        className="block w-full p-3 border-[0.5px] border-border-subtle rounded-[8px] text-text-primary placeholder-text-muted bg-elevated focus:outline-none focus:border-accent text-[14px] min-h-[80px] resize-y hover:border-[rgba(255,255,255,0.2)] transition-all shadow-none"
                                        placeholder={`Replying to ${localComment.username}...`}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end mt-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="px-3 py-1.5 rounded-full text-[12px] font-medium text-text-muted hover:text-text-primary cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!replyContent.trim()}
                                            className="bg-accent hover:bg-accent-light text-white px-4 py-1.5 rounded-[6px] text-[12px] font-medium transition-all disabled:opacity-50 cursor-pointer"
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
                className="flex items-center gap-2 text-text-muted hover:text-text-main hover:bg-border-subtle p-2 rounded-full mb-4 transition-colors w-max"
                aria-label="Back to feed"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[13px] font-medium pr-1">Back to Feed</span>
            </button>

            {/* Post */}
            <PostCard post={post} isDetail={true} onCommentClick={handleCommentToggle} />

            {/* Comments Section */}
            {showComments && (
                <div className="w-full mt-6">
                    <h3 className="text-[15px] font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <span className="bg-[rgba(124,58,237,0.2)] text-accent-light text-[10px] px-2.5 py-1 rounded-[20px] font-semibold">{comments.length}</span>
                        Comments
                    </h3>

                    {/* Comment Form */}
                    {user ? (
                        <div className="mb-8">
                            {!showAddCommentForm ? (
                                <button
                                    onClick={() => setShowAddCommentForm(true)}
                                    className="flex items-center gap-2 text-text-secondary font-medium bg-elevated border-[0.5px] border-border-subtle hover:border-[rgba(255,255,255,0.2)] hover:text-text-primary px-4 py-2 rounded-[8px] transition-colors text-[13px] cursor-pointer shadow-none"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Write a Comment
                                </button>
                            ) : (
                                <form onSubmit={handleCommentSubmit} className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <textarea
                                            className="block w-full p-[10px] border-[0.5px] border-border-subtle rounded-[8px] text-text-primary placeholder-text-muted bg-elevated focus:outline-none focus:border-accent text-[14px] resize-y min-h-[100px] transition-all cursor-text hover:border-[rgba(255,255,255,0.2)]"
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
                                            className="px-4 py-2 rounded-[6px] font-medium text-[12px] text-text-muted hover:text-text-primary cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-[6px] font-medium text-[12px] text-white transition-all shadow-none ${newComment.trim() ? 'bg-accent hover:bg-accent-light cursor-pointer' : 'bg-elevated border border-border-subtle text-text-muted cursor-not-allowed'}`}
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Post
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="bg-elevated p-6 rounded-[8px] text-center mb-8 border border-border-subtle border-dashed">
                            <p className="text-text-primary text-[14px] font-medium mb-4">Log in or sign up to join the discussion</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => navigate('/login')} className="text-text-primary border border-border-subtle hover:bg-surface px-5 py-2 rounded-[6px] font-medium text-[12px] transition-colors cursor-pointer">Log In</button>
                                <button onClick={() => navigate('/register')} className="text-white bg-accent hover:bg-accent-light px-5 py-2 rounded-[6px] font-medium text-[12px] transition-colors cursor-pointer">Sign Up</button>
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
