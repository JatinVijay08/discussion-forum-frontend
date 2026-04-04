import React from 'react';
import { postService } from '../api/services';
import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../utils/timeAgo';

const PostCard = ({ post: initialPost, isDetail = false, onCommentClick, showDelete = false, onDelete }) => {
    const navigate = useNavigate();
    const [post, setPost] = React.useState(initialPost);
    const [shared, setShared] = React.useState(false);

    React.useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    const handleVote = async (e, type) => {
        e.stopPropagation();
        try {
            const updatedPost = await postService.vote(post.id, type);
            setPost(updatedPost);
        } catch (error) {
            console.error("Vote failed", error);
        }
    };

    const goToDetail = () => {
        if (!isDetail) navigate(`/post/${post.id}`);
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/post/${post.id}`;
        const shareData = {
            title: `Discussion Forum: ${post.title}`,
            text: post.content?.slice(0, 100) + '...',
            url: url,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed:', err);
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            console.error('Clipboard failed:', err);
        }
    };

    return (
        <div
            onClick={goToDetail}
            className={`card-l2 p-6 transition-all duration-200 relative group ${
                isDetail ? 'cursor-default' : 'hover-glow cursor-pointer'
            }`}
            style={{ borderRadius: '1.5rem' }}
        >
            {/* Delete */}
            {showDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                    className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
            )}

            {/* Header meta */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-canvas text-[11px] font-[800]">
                    {(post.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="text-[13px] font-[600] text-on-surface">
                        {post.username || 'user'}
                    </span>
                    <span className="text-outline-variant text-[11px]">·</span>
                    <span className="label-meta text-[10px]" style={{ letterSpacing: '0.1em' }}>
                        {timeAgo(post.createdAt || post.createdDate)}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-[1.25rem] font-[700] text-on-surface mb-2 leading-[1.35] tracking-tight">
                {post.title}
            </h3>

            {/* Content */}
            <p className={`text-[1rem] text-on-surface-variant leading-[1.7] mb-5 whitespace-pre-line break-words ${
                isDetail ? '' : 'line-clamp-3'
            }`}>
                {post.content}
            </p>

            {/* Media */}
            {post.mediaUrl && (
                <div
                    className="mb-5 rounded-2xl overflow-hidden"
                    style={{ background: '#060e20' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {post.mediaType === 'video' ? (
                        <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-h-[450px] object-contain"
                            preload="metadata"
                        />
                    ) : (
                        <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-h-[450px] object-contain img-hover"
                            loading="lazy"
                        />
                    )}
                </div>
            )}

            {/* Footer actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-auto">
                {/* Vote pill */}
                <div className="vote-pill px-1 py-1 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => handleVote(e, 'upvote')}
                        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
                            post.userVote === 'upvote' 
                            ? 'text-white bg-[#818cf8] ring-2 ring-[#818cf8]/50 shadow-[0_0_20px_rgba(129,140,248,0.5)]' 
                            : 'text-on-surface-variant hover:text-[#818cf8] hover:bg-[#818cf8]/10'
                        }`}
                        title="Upvote"
                    >
                        <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${post.userVote === 'upvote' ? 'filled' : ''}`}>arrow_upward</span>
                    </button>
                    <span className={`text-[13px] sm:text-[15px] font-[900] min-w-[28px] sm:min-w-[32px] text-center transition-all duration-300 ${
                        post.userVote === 'upvote' ? 'text-[#818cf8] scale-110' : post.userVote === 'downvote' ? 'text-[#ff5252] scale-110' : 'text-on-surface'
                    }`}>
                        {post.voteCount || 0}
                    </span>
                    <button
                        onClick={(e) => handleVote(e, 'downvote')}
                        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
                            post.userVote === 'downvote' 
                            ? 'text-white bg-[#ff5252] ring-2 ring-[#ff5252]/50 shadow-[0_0_20px_rgba(255,82,82,0.5)]' 
                            : 'text-on-surface-variant hover:text-[#ff5252] hover:bg-[#ff5252]/10'
                        }`}
                        title="Downvote"
                    >
                        <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${post.userVote === 'downvote' ? 'filled' : ''}`}>arrow_downward</span>
                    </button>
                </div>

                {/* Comments */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onCommentClick) onCommentClick();
                        else navigate(`/post/${post.id}`);
                    }}
                    className="btn-ghost btn-pill flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-[600] text-on-surface-variant hover:text-on-surface"
                >
                    <span className="material-symbols-outlined text-[15px] sm:text-[16px]">chat_bubble</span>
                    {post.totalCommentCount ?? post.commentCount ?? 0}
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className={`btn-ghost btn-pill flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-[600] transition-all duration-300 ${
                        shared ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    <span className={`material-symbols-outlined text-[15px] sm:text-[16px] ${shared ? 'filled' : ''}`}>
                        {shared ? 'check_circle' : 'share'}
                    </span>
                    <span className="hidden sm:inline">{shared ? 'Link Copied' : 'Share'}</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;