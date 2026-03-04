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
            <div className={`flex flex-col gap-3 group ${depth > 0 ? 'ml-8 md:ml-12 border-l-2 border-white/5 pl-4' : ''}`}>
                <div className="flex gap-3">
                    {/* Vote Sidebar for Comment */}
                    <div className="flex flex-col items-center pt-1 w-8 shrink-0">
                        <button
                            onClick={(e) => handleVote(e, 'upvote')}
                            className={`p-1 rounded-full transition-colors cursor-pointer ${localComment.voteType === 'upvote' ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:bg-zinc-800 hover:text-orange-400'}`}
                        >
                            <ArrowBigUp className={`w-5 h-5 ${localComment.voteType === 'upvote' ? 'fill-current' : ''}`} />
                        </button>
                        <span className={`text-xs font-bold my-0.5 ${localComment.voteType === 'upvote' ? 'text-orange-500' : localComment.voteType === 'downvote' ? 'text-blue-500' : 'text-zinc-400'}`}>
                            {localComment.voteCount || 0}
                        </span>
                        <button
                            onClick={(e) => handleVote(e, 'downvote')}
                            className={`p-1 rounded-full transition-colors cursor-pointer ${localComment.voteType === 'downvote' ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-500 hover:bg-zinc-800 hover:text-blue-400'}`}
                        >
                            <ArrowBigDown className={`w-5 h-5 ${localComment.voteType === 'downvote' ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-zinc-300 text-[10px] font-bold shadow-inner">
                                {localComment.username ? localComment.username[0].toUpperCase() : 'U'}
                            </div>
                            <span className="text-sm font-bold text-white">
                                {localComment.username || 'User'}
                            </span>
                            <span className="text-xs text-zinc-500">{new Date(localComment.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-zinc-300 whitespace-pre-line break-all leading-relaxed bg-zinc-900/50 p-3 rounded-lg rounded-tl-none border border-white/5">
                            {localComment.content}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-4 mt-2">
                            {user && (
                                <button
                                    onClick={() => setReplyingTo(isReplying ? null : localComment.id)}
                                    className="text-xs font-bold text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    Reply
                                </button>
                            )}
                        </div>

                        {/* Reply Form */}
                        {isReplying && (
                            <form onSubmit={submitReply} className="mt-3 animate-in fade-in slide-in-from-top-1">
                                <textarea
                                    className="block w-full p-3 border border-white/10 rounded-xl text-white placeholder-zinc-500 bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 text-sm min-h-[80px]"
                                    placeholder={`Replying to ${localComment.username}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setReplyingTo(null)}
                                        className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!replyContent.trim()}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Render Replies Recursively */}
                {
                    localComment.replies && localComment.replies.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            {localComment.replies.map(reply => (
                                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                            ))}
                        </div>
                    )
                }
            </div >
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
                                <>
                                    {comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="px-3 py-1 text-xs font-bold rounded-md bg-zinc-800 text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 hover:text-white transition-colors"
                                            >
                                                Previous
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, index) => {
                                                    // Show limited page numbers if there are too many
                                                    if (
                                                        index === 0 ||
                                                        index === totalPages - 1 ||
                                                        (index >= currentPage - 1 && index <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => handlePageChange(index)}
                                                                className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-md transition-all ${currentPage === index
                                                                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/20'
                                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        );
                                                    } else if (
                                                        index === currentPage - 2 ||
                                                        index === currentPage + 2
                                                    ) {
                                                        return <span key={index} className="text-zinc-600 text-xs self-end pb-1">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                                className="px-3 py-1 text-xs font-bold rounded-md bg-zinc-800 text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 hover:text-white transition-colors"
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
