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
        <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="border-b border-white/10 pb-4 mb-6">
                <h1 className="text-xl font-bold text-white">Create a post</h1>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button className="flex-1 py-3 text-center text-sm font-bold text-orange-600 border-b-2 border-orange-600 bg-transparent">
                        Post
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="block w-full px-4 py-3 border border-white/10 rounded-lg text-white placeholder-zinc-500 bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm transition-all shadow-xs cursor-text"
                                placeholder="Title"
                                maxLength={300}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="absolute right-3 top-3.5 text-xs text-zinc-500 font-mono">{title.length}/300</div>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={8}
                                className="block w-full px-4 py-3 border border-white/10 rounded-lg text-white placeholder-zinc-500 bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm resize-none transition-all shadow-xs cursor-text"
                                placeholder="Text (optional)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                className={`px-8 py-2.5 rounded-full font-bold text-white transition-all transform hover:-translate-y-0.5 shadow-md ${title ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20 cursor-pointer' : 'bg-zinc-800 cursor-not-allowed'}`}
                                disabled={!title}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                        Posting Rules
                    </h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-zinc-400 space-y-2 leading-relaxed">
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
