import React from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { postService } from '../api/services';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post: initialPost, isDetail = false, onCommentClick, showDelete = false, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = React.useState(initialPost);

    // Update local state if prop changes (e.g. parent refresh)
    React.useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    const handleVote = async (e, type) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const updatedPost = await postService.vote(post.id, type);
            setPost(updatedPost);
        } catch (error) {
            console.error("Vote failed", error);
        }
    };

    const goToDetail = () => {
        if (!isDetail) {
            navigate(`/post/${post.id}`);
        }
    };

    return (
        <div
            onClick={goToDetail}
            className={`flex bg-surface border-[0.5px] border-border-subtle rounded-[10px] p-[14px] ${isDetail ? 'cursor-default' : 'cursor-pointer'} post-card-hover mb-4 group relative ${post.isHot ? 'border-border-active' : ''}`}
        >
            {/* Delete Button (Visible only if showDelete is true) */}
            {showDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(post.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                    title="Delete Post"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Vote Column */}
            <div className="flex flex-col items-center min-w-[32px] w-[32px] shrink-0 mr-3">
                <button
                    onClick={(e) => handleVote(e, 'upvote')}
                    className={`w-6 h-6 flex items-center justify-center rounded-[4px] upvote-bounce cursor-pointer ${post.userVote === 'upvote' ? 'bg-accent text-white' : 'bg-elevated text-text-muted hover:text-accent'}`}
                >
                    <ArrowBigUp className={`w-4 h-4 ${post.userVote === 'upvote' ? 'fill-current' : ''}`} />
                </button>
                <span className={`text-[12px] font-semibold my-1 ${post.userVote === 'upvote' ? 'text-accent-light' : post.userVote === 'downvote' ? 'text-text-muted' : 'text-accent-light'}`}>
                    {post.voteCount || 0}
                </span>
                <button
                    onClick={(e) => handleVote(e, 'downvote')}
                    className={`w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer ${post.userVote === 'downvote' ? 'bg-elevated text-accent' : 'bg-elevated text-text-muted hover:text-accent-light'}`}
                >
                    <ArrowBigDown className={`w-4 h-4 ${post.userVote === 'downvote' ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                {/* Header (Tag & Meta) */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {/* Tag Pill */}
                    <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold tag-pill-hover cursor-pointer ${post.isHot ? 'bg-[rgba(16,185,129,0.15)] text-accent-green' : 'bg-[rgba(124,58,237,0.2)] text-accent-light'}`}>
                        {post.isHot ? 'Hot' : 'Discussion'}
                    </span>
                    
                    {/* Meta Info */}
                    <span className="text-[11px] text-text-muted truncate">
                        r/community · posted by u/{post.username || 'user'} · {new Date(post.createdDate || Date.now()).toLocaleDateString()}
                    </span>
                </div>

                {/* Body */}
                <h3 className="text-[15px] font-semibold text-text-primary mb-1.5 leading-[1.5] hover:text-accent-light transition-colors duration-100">{post.title}</h3>
                <p className={`text-[14px] text-text-secondary leading-[1.4] mb-3 whitespace-pre-line break-all ${isDetail ? '' : 'line-clamp-3'}`}>{post.content}</p>

                {/* Footer Chips */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            if (onCommentClick) {
                                e.stopPropagation();
                                onCommentClick();
                            }
                        }}
                        className="flex items-center gap-1.5 bg-elevated text-text-secondary hover:text-text-primary px-2 py-[3px] rounded-[4px] text-[11px] font-medium transition-colors"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentCount || 0} comments</span>
                    </button>
                    <button className="flex items-center gap-1.5 bg-elevated text-text-secondary hover:text-text-primary px-2 py-[3px] rounded-[4px] text-[11px] font-medium transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                    </button>
                    <button className="flex items-center gap-1.5 bg-elevated text-text-secondary hover:text-text-primary px-2 py-[3px] rounded-[4px] text-[11px] font-medium transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        <span>More</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
