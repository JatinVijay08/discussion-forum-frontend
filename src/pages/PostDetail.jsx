import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, commentService } from '../api/services';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [showComments, setShowComments] = useState(true);
    const [showAddCommentForm, setShowAddCommentForm] = useState(false);

    useEffect(() => { fetchPost(); if (showComments) fetchComments(0); }, [id]);

    const fetchPost = async () => {
        try { setPost(await postService.getPostById(id)); }
        catch (error) { console.error("Failed to load post", error); }
        finally { setLoading(false); }
    };

    const fetchComments = async (page = currentPage) => {
        try {
            setLoadingComments(true);
            const data = await commentService.getCommentsByPostId(id, page, 50);
            const flatComments = data.content || [];
            const commentMap = {};
            const rootComments = [];
            flatComments.forEach(c => { c.replies = []; commentMap[c.id] = c; });
            flatComments.forEach(c => {
                if (c.parentComment && c.parentComment !== 'null' && c.parentComment !== 0) {
                    const parent = commentMap[c.parentComment];
                    if (parent) parent.replies.push(c);
                    else rootComments.push(c);
                } else rootComments.push(c);
            });
            setComments(rootComments);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number || page);
        } catch (error) { console.error("Failed to load comments", error); setComments([]); }
        finally { setLoadingComments(false); }
    };

    const handlePageChange = (newPage) => { if (newPage >= 0 && newPage < totalPages) fetchComments(newPage); };
    const handleCommentToggle = () => { const next = !showComments; setShowComments(next); if (next && comments.length === 0) fetchComments(0); };

    const handleCommentSubmit = async (e, parentId = null) => {
        e?.preventDefault();
        if (!newComment.trim()) return;
        try { await commentService.addComment(id, newComment, parentId); setNewComment(''); setReplyingTo(null); fetchComments(0); fetchPost(); }
        catch (error) { /* handled globally */ }
    };

    const CommentItem = ({ comment, depth = 0 }) => {
        const [replyContent, setReplyContent] = useState('');
        const isReplying = replyingTo === comment.id;
        const [localComment, setLocalComment] = useState(comment);
        const [isCollapsed, setIsCollapsed] = useState(false);

        useEffect(() => { setLocalComment(comment); }, [comment]);

        const submitReply = async (e) => {
            e.preventDefault();
            if (!replyContent.trim()) return;
            try { await commentService.addComment(id, replyContent, comment.id); setReplyContent(''); setReplyingTo(null); fetchComments(0); }
            catch (error) { /* handled globally */ }
        };

        const handleVote = async (e, type) => {
            e.stopPropagation();
            try {
                const updated = await commentService.voteOnComment(localComment.id, type);
                let newVoteType = updated.voteType;
                if (newVoteType === 'null' || newVoteType === undefined) newVoteType = null;
                setLocalComment(prev => ({ ...prev, ...updated, voteType: newVoteType, voteCount: updated.voteCount ?? prev.voteCount, replies: prev.replies, username: prev.username }));
            } catch (error) { console.error("Vote failed", error); }
        };

        return (
            <div className={`flex flex-col gap-4 relative ${depth > 0 ? 'ml-5 pl-5' : ''}`}
                 style={depth > 0 ? { borderLeft: '2px solid rgba(129, 140, 248, 0.12)' } : {}}>
                {depth > 0 && localComment.replies?.length > 0 && (
                    <button onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -left-[9px] top-8 w-4 h-4 bg-canvas rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary z-10 transition-colors cursor-pointer ghost-border text-[10px] font-[700]">
                        {isCollapsed ? '+' : '−'}
                    </button>
                )}

                {isCollapsed ? (
                    <div className="flex gap-2 items-center py-2 px-4 rounded-xl cursor-pointer hover:bg-surface-high/30 transition-colors w-max" style={{ background: '#131b2e' }} onClick={() => setIsCollapsed(false)}>
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-canvas text-[9px] font-[800]">
                            {(localComment.username || 'U')[0].toUpperCase()}
                        </div>
                        <span className="text-[12px] font-[500] text-on-surface-variant">
                            {localComment.username} · {localComment.replies?.length || 0} replies
                        </span>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {/* Vote */}
                        <div className="flex flex-col items-center pt-1 min-w-[28px]">
                            <button onClick={(e) => handleVote(e, 'upvote')}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
                                    localComment.voteType === 'upvote' 
                                    ? 'text-white bg-[#818cf8] ring-2 ring-[#818cf8]/50 shadow-[0_0_15px_rgba(129,140,248,0.4)]' 
                                    : 'text-on-surface-variant hover:text-[#818cf8] hover:bg-[#818cf8]/10'
                                }`}>
                                <span className={`material-symbols-outlined text-[17px] ${localComment.voteType === 'upvote' ? 'filled' : ''}`}>arrow_upward</span>
                            </button>
                            <span className={`text-[12px] font-[900] my-1 transition-all duration-300 ${
                                localComment.voteType === 'upvote' ? 'text-[#818cf8] scale-110' : localComment.voteType === 'downvote' ? 'text-[#ff5252] scale-110' : 'text-on-surface'
                            }`}>
                                {localComment.voteCount || 0}
                            </span>
                            <button onClick={(e) => handleVote(e, 'downvote')}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
                                    localComment.voteType === 'downvote' 
                                    ? 'text-white bg-[#ff5252] ring-2 ring-[#ff5252]/50 shadow-[0_0_15px_rgba(255,82,82,0.4)]' 
                                    : 'text-on-surface-variant hover:text-[#ff5252] hover:bg-[#ff5252]/10'
                                }`}>
                                <span className={`material-symbols-outlined text-[17px] ${localComment.voteType === 'downvote' ? 'filled' : ''}`}>arrow_downward</span>
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Author */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-canvas text-[9px] font-[800]">
                                    {(localComment.username || 'U')[0].toUpperCase()}
                                </div>
                                <span className="text-[12px] font-[600] text-on-surface">{localComment.username || 'User'}</span>
                                <span className="text-[10px] text-outline-variant">·</span>
                                <span className="label-meta text-[9px] text-outline-variant" style={{ letterSpacing: '0.08em' }}>{timeAgo(localComment.createdAt || localComment.createdDate)}</span>
                            </div>

                            {/* Content */}
                            <div className="text-[14px] text-on-surface-variant whitespace-pre-line break-words leading-[1.7] py-3 px-4 rounded-xl" style={{ background: '#131b2e' }}>
                                {localComment.content}
                            </div>

                            {/* Reply action */}
                            {user && (
                                <button onClick={() => setReplyingTo(isReplying ? null : localComment.id)}
                                    className="mt-2 text-[11px] font-[700] text-primary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none p-0">
                                    Reply
                                </button>
                            )}

                            {/* Reply Form */}
                            {isReplying && (
                                <form onSubmit={submitReply} className="mt-3 space-y-2">
                                    <textarea className="w-full p-4 obsidian-input rounded-xl text-[14px] leading-[1.6] min-h-[80px] resize-y"
                                        placeholder={`Replying to ${localComment.username}...`}
                                        value={replyContent} onChange={(e) => setReplyContent(e.target.value)} autoFocus />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setReplyingTo(null)}
                                            className="btn-ghost px-4 py-2 text-[12px] font-[600] cursor-pointer" style={{ borderRadius: '0.5rem' }}>Cancel</button>
                                        <button type="submit" disabled={!replyContent.trim()}
                                            className={`btn-primary btn-pill px-5 py-2 text-[12px] ${!replyContent.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>Reply</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Nested replies */}
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
            <div className="flex justify-center items-center min-h-[50vh] pt-24">
                <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">diamond</span>
            </div>
        );
    }

    if (!post) return <div className="text-center py-16 text-on-surface-variant pt-24">Post not found</div>;

    return (
        <div className="max-w-[720px] mx-auto pt-24 pb-16 px-8">
            <button onClick={() => navigate('/')}
                className="btn-ghost btn-pill flex items-center gap-2 px-5 py-2.5 text-[12px] font-[700] text-on-surface-variant hover:text-on-surface mb-8 cursor-pointer uppercase tracking-[0.1em]">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Feed
            </button>

            <PostCard post={post} isDetail={true} onCommentClick={handleCommentToggle} />

            {/* Comments */}
            {showComments && (
                <div className="mt-12">
                    <h3 className="text-[1.125rem] font-[700] text-on-surface mb-8 flex items-center gap-3">
                        <span className="label-meta text-primary text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(189, 194, 255, 0.1)' }}>
                            {post.totalCommentCount ?? post.commentCount ?? comments.length}
                        </span>
                        Discussion
                    </h3>

                    {/* Comment Input */}
                    {user ? (
                        <div className="mb-10">
                            {!showAddCommentForm ? (
                                <button onClick={() => setShowAddCommentForm(true)}
                                    className="w-full flex items-center gap-3 p-5 rounded-xl text-[14px] font-[500] text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
                                    style={{ background: '#131b2e' }}>
                                    <span className="material-symbols-outlined text-[18px] text-primary">chat_bubble</span>
                                    Share your thoughts...
                                </button>
                            ) : (
                                <form onSubmit={handleCommentSubmit} className="space-y-3">
                                    <textarea className="w-full p-5 obsidian-input rounded-xl text-[14px] leading-[1.7] min-h-[120px] resize-y"
                                        placeholder="What are your thoughts?" value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)} autoFocus />
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowAddCommentForm(false)}
                                            className="btn-ghost px-5 py-2.5 text-[13px] font-[600] cursor-pointer" style={{ borderRadius: '0.5rem' }}>Cancel</button>
                                        <button type="submit" disabled={!newComment.trim()}
                                            className={`btn-primary btn-pill px-6 py-2.5 text-[13px] flex items-center gap-2 ${!newComment.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <span className="material-symbols-outlined text-[16px]">send</span>
                                            Publish
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="card-l2 p-8 text-center mb-10 flex flex-col items-center" style={{ borderRadius: '1.5rem' }}>
                            <h4 className="text-on-surface text-[1rem] font-[700] mb-2">Join the Discussion</h4>
                            <p className="text-on-surface-variant text-[13px] mb-6 max-w-sm">Sign in to leave a comment, vote, and curate the collective.</p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <button onClick={() => navigate('/login')} className="btn-secondary btn-pill px-6 py-2.5 text-[13px] cursor-pointer">Sign In</button>
                                <button onClick={() => navigate('/register')} className="btn-primary btn-pill px-6 py-2.5 text-[13px] cursor-pointer">Join Forum</button>
                            </div>
                        </div>
                    )}

                    {/* Comment List */}
                    {loadingComments ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {comments.length === 0 ? (
                                <p className="text-on-surface-variant text-center text-[14px] py-8">No comments yet. Begin the discourse.</p>
                            ) : (
                                <>
                                    {comments.map(comment => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 pt-6" style={{ borderTop: '1px solid rgba(69, 70, 83, 0.15)' }}>
                                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}
                                                className="btn-ghost px-3 py-1.5 text-[12px] font-[700] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderRadius: '0.5rem' }}>
                                                Previous
                                            </button>
                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
                                                        return (
                                                            <button key={i} onClick={() => handlePageChange(i)}
                                                                className={`min-w-[32px] h-[32px] flex items-center justify-center text-[12px] font-[700] rounded-md cursor-pointer transition-all ${
                                                                    currentPage === i ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high/30'
                                                                }`}>
                                                                {i + 1}
                                                            </button>
                                                        );
                                                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                                                        return <span key={i} className="text-outline-variant text-[12px] self-end pb-1 px-1">…</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
                                                className="btn-ghost px-3 py-1.5 text-[12px] font-[700] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderRadius: '0.5rem' }}>
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
