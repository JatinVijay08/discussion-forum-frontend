import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../api/services';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await postService.createPost({
                title,
                content
            });
            navigate('/');
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    return (
        <div className="max-w-[740px] mx-auto pt-24 pb-8 px-4">
            <div className="flex items-center gap-3 pb-6 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-xl">+</span>
                </div>
                <h1 className="text-[24px] font-bold text-white tracking-tight">Create a post</h1>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden transition-colors duration-300 mb-8">
                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-white/5">
                    <button className="flex-1 py-4 text-center text-[15px] font-bold text-white border-b-2 border-accent bg-transparent cursor-default tracking-wide">
                        Post Discussion
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="block w-full px-5 py-4 glass-input rounded-2xl text-[16px] font-semibold tracking-wide transition-all shadow-inner"
                                placeholder="An interesting title"
                                maxLength={300}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="absolute right-4 top-4 text-[12px] text-slate-400 font-mono bg-bg-base/80 px-2 py-0.5 rounded-md">{title.length}/300</div>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={8}
                                className="block w-full px-5 py-4 glass-input rounded-2xl text-[15px] resize-none transition-all shadow-inner leading-relaxed"
                                placeholder="What are your thoughts?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                className={`px-8 py-3 rounded-full font-bold text-[14px] text-white transition-all transform active:scale-95 shadow-lg ${title ? 'bg-accent hover:bg-accent-hover shadow-accent/20 cursor-pointer' : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed shadow-none'}`}
                                disabled={!title}
                            >
                                Publish Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-6">
                <div className="glass-panel p-6 rounded-2xl transition-colors duration-300">
                    <h3 className="font-bold text-[15px] text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        Posting Rules
                    </h3>
                    <ol className="list-decimal list-inside text-[13px] text-slate-300 space-y-3 leading-relaxed">
                        <li className="pl-2">Remember the human</li>
                        <li className="pl-2">Behave like you would in real life</li>
                        <li className="pl-2">Look for the original source of content</li>
                        <li className="pl-2">Search for duplicates before posting</li>
                        <li className="pl-2">Read the community's rules</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
