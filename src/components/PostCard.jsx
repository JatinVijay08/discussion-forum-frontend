import React from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { postService } from '../api/services';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post: initialPost, isDetail = false, onCommentClick, showDelete = false, onDelete }) => {
    const navigate = useNavigate();
    const [post, setPost] = React.useState(initialPost);

    // Update local state if prop changes (e.g. parent refresh)
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
            className={`flex bg-black/20 hover:border-white/30 border border-white/10 rounded-xl ${isDetail ? 'cursor-default' : 'cursor-pointer'} transition-all duration-300 hover:shadow-lg hover:shadow-white/5 mb-4 overflow-hidden group relative`}
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

            {/* Vote Sidebar */}
            <div className="flex flex-col items-center p-2 bg-[#101214] w-10 sm:w-12 border-r border-white/10">
                <button
                    onClick={(e) => handleVote(e, 'upvote')}
                    className={`p-1 rounded transition-colors cursor-pointer ${post.userVote === 'upvote' ? 'text-orange-600 bg-orange-100 dark:bg-orange-500/20' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-orange-500'}`}
                >
                    <ArrowBigUp className={`w-6 h-6 ${post.userVote === 'upvote' ? 'fill-current' : ''}`} />
                </button>
                <span className={`text-sm font-bold my-1 ${post.userVote === 'upvote' ? 'text-orange-600' : post.userVote === 'downvote' ? 'text-blue-600' : 'text-gray-700 dark:text-zinc-300'}`}>
                    {post.voteCount || 0}
                </span>
                <button
                    onClick={(e) => handleVote(e, 'downvote')}
                    className={`p-1 rounded transition-colors cursor-pointer ${post.userVote === 'downvote' ? 'text-blue-600 bg-blue-100 dark:bg-blue-500/20' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-blue-500'}`}
                >
                    <ArrowBigDown className={`w-6 h-6 ${post.userVote === 'downvote' ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="bg-[#140e2657] p-4 w-full">
                {/* Header */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 gap-2">
                    <div className="flex items-center gap-1 group/user">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {post.username ? post.username[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover/user:underline">u/{post.username || 'user'}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span>{new Date(post.createdDate || Date.now()).toLocaleDateString()}</span>
                </div>

                {/* Body */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{post.title}</h3>
                <p className={`text-sm text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line leading-relaxed break-all ${isDetail ? '' : 'line-clamp-3'}`}>{post.content}</p>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
                    <button
                        onClick={(e) => {
                            if (onCommentClick) {
                                e.stopPropagation();
                                onCommentClick();
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0} Comments</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-full transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
