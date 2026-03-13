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
            console.error("Create post failed", error);
            alert("Failed to create post. Please try again.");
        }
    };

    return (
        <div className="max-w-[740px] mx-auto pt-20 pb-8 px-4">
            <div className="border-b border-[0.5px] border-border-subtle pb-4 mb-6">
                <h1 className="text-[20px] font-semibold text-text-primary">Create a post</h1>
            </div>

            <div className="bg-surface rounded-[12px] border-[0.5px] border-border-subtle shadow-none overflow-hidden transition-colors duration-300">
                {/* Tabs */}
                <div className="flex border-b-[0.5px] border-border-subtle">
                    <button className="flex-1 py-3 text-center text-[14px] font-medium text-text-primary border-b-2 border-accent bg-transparent cursor-default">
                        Post
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="block w-full px-4 py-2.5 border-[0.5px] border-border-subtle rounded-[8px] text-text-primary placeholder-text-muted bg-bg-base/50 focus:outline-none focus:border-accent text-[14px] transition-all shadow-none cursor-text hover:border-[rgba(255,255,255,0.2)]"
                                placeholder="Title"
                                maxLength={300}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="absolute right-3 top-2.5 text-[12px] text-text-muted font-mono">{title.length}/300</div>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={8}
                                className="block w-full px-4 py-3 border-[0.5px] border-border-subtle rounded-[8px] text-text-primary placeholder-text-muted bg-bg-base/50 focus:outline-none focus:border-accent text-[14px] resize-none transition-all shadow-none cursor-text hover:border-[rgba(255,255,255,0.2)]"
                                placeholder="Text (optional)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t-[0.5px] border-border-subtle">
                            <button
                                type="submit"
                                className={`px-6 py-[8px] rounded-[6px] font-medium text-[13px] text-white transition-all transform active:scale-95 shadow-none ${title ? 'bg-accent hover:bg-accent-light cursor-pointer' : 'bg-surface border border-[0.5px] border-border-subtle text-text-muted cursor-not-allowed'}`}
                                disabled={!title}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-6">
                <div className="bg-surface p-5 rounded-[12px] border-[0.5px] border-border-subtle shadow-none transition-colors duration-300">
                    <h3 className="font-semibold text-[14px] text-text-primary mb-3 flex items-center gap-2">
                        Posting Rules
                    </h3>
                    <ol className="list-decimal list-inside text-[13px] text-text-secondary space-y-2 leading-relaxed">
                        <li>Remember the human</li>
                        <li>Behave like you would in real life</li>
                        <li>Look for the original source of content</li>
                        <li>Search for duplicates before posting</li>
                        <li>Read the community's rules</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
