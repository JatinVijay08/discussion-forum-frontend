import React from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { postService } from '../api/services';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post: initialPost, isDetail = false, onCommentClick, showDelete = false, onDelete }) => {
    const navigate = useNavigate();
    const [post, setPost] = React.useState(initialPost);

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
        if (!isDetail) {
            navigate(`/post/${post.id}`);
        }
    };

    return (
        <div
            onClick={goToDetail}
            className={`flex items-stretch glass-panel p-[20px] rounded-2xl gap-4 ${isDetail ? 'cursor-default' : 'cursor-pointer'} hover:bg-white/10 transition-all duration-300 mb-5 group relative ${post.isHot ? 'border-accent/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : ''}`}
        >
            {/* Delete Button */}
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
            <div onClick={(e)=>e.stopPropagation() } className="flex flex-col items-center justify-start gap-1 w-[44px] shrink-0 pt-1">
                <button
                    onClick={(e) => handleVote(e, 'upvote')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 ${post.userVote === 'upvote' ? 'text-accent bg-accent/20' : 'text-slate-500 hover:text-accent hover:bg-accent/10'}`}
                >
                    <ArrowBigUp className={`w-6 h-6 ${post.userVote === 'upvote' ? 'fill-current' : ''}`} />
                </button>
                <span className={`text-[16px] font-bold cursor-default leading-none transition-colors py-1 ${post.userVote === 'upvote' ? 'text-accent' : post.userVote === 'downvote' ? 'text-red-400' : 'text-slate-300'}`}>
                    {post.voteCount || 0}
                </span>
                <button
                    onClick={(e) => handleVote(e, 'downvote')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 ${post.userVote === 'downvote' ? 'text-red-400 bg-red-500/20' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}
                >
                    <ArrowBigDown className={`w-6 h-6 ${post.userVote === 'downvote' ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-3 py-[3px] rounded-full text-[11px] font-bold tracking-wide uppercase border border-white/10 ${post.isHot ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {post.isHot ? 'Hot' : 'Discussion'}
                    </span>
                    <span className="text-[13px] text-slate-400 truncate font-medium">
                        r/community <span className="text-slate-600 mx-1">•</span> Posted by <span className="text-slate-300">u/{post.username || 'user'}</span> <span className="text-slate-600 mx-1">•</span> {new Date(post.createdDate || Date.now()).toLocaleDateString()}
                    </span>
                </div>

                {/* Body */}
                <h3 className="text-[20px] font-bold text-white mb-2.5 leading-[1.4] hover:text-accent transition-colors duration-200 tracking-tight">
                    {post.title}
                </h3>
                <p className={`text-[15px] text-slate-300 leading-[1.6] mb-5 whitespace-pre-line break-words opacity-90 ${isDetail ? '' : 'line-clamp-3'}`}>
                    {post.content}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-auto">
                    <button
                        onClick={(e) => {
                             e.stopPropagation();
        if (onCommentClick) {
            onCommentClick();
        } else {
            navigate(`/post/${post.id}`);
        }
    }}
                        className="flex items-center gap-2 bg-white/5 border border-transparent hover:border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.totalCommentCount ?? post.commentCount ?? 0} Comments</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white/5 border border-transparent hover:border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer shadow-sm">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white/5 border border-transparent hover:border-white/10 text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer shadow-sm h-[38px] w-[38px] justify-center">
                        <MoreHorizontal className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;