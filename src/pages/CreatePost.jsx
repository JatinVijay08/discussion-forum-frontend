import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../api/services';

export default function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_SIZE = 50 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];

    const handleFile = (file) => {
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Unsupported file type', type: 'warning' } }));
            return;
        }
        if (file.size > MAX_SIZE) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'File exceeds 50MB limit', type: 'warning' } }));
            return;
        }
        setMediaFile(file);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        setMediaPreview(URL.createObjectURL(file));
    };

    const clearMedia = () => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setLoading(true);
        try {
            await postService.createPost(title, content, mediaFile);
            navigate('/');
        } catch (err) {
            // Handled globally
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="pt-24 pb-16 px-8 md:px-12 max-w-[80rem] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Editor — Left */}
                <div className="lg:col-span-8">
                    <p className="label-meta text-primary mb-3">New Post</p>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-[800] text-on-surface tracking-[-0.04em] leading-[0.9] mb-12">
                        Create a<br />new post.
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title */}
                        <div className="focus-underline">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-[1.75rem] font-[700] text-on-surface tracking-tight outline-none pb-3"
                                placeholder="Post Title"
                                style={{ color: title ? '#dae2fd' : '#2d3449' }}
                            />
                        </div>

                        {/* Body */}
                        <div className="rounded-xl p-6" style={{ background: 'rgba(19, 27, 46, 0.5)' }}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-transparent text-[1.125rem] text-on-surface-variant leading-[1.7] outline-none resize-none min-h-[300px]"
                                placeholder="Write your post content..."
                            />
                        </div>

                    </form>
                </div>

                {/* Sidebar — Right */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
                    {/* Media Upload */}
                    <div className="card-l2 p-6" style={{ borderRadius: '1.5rem' }}>
                        <p className="label-meta text-on-surface-variant mb-4">Media</p>

                        {!mediaPreview ? (
                            <div
                                className={`flex flex-col items-center justify-center py-10 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isDragOver ? 'bg-primary/10' : 'bg-surface-lowest/50 hover:bg-surface-lowest'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center mb-3 hover:bg-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-[24px] text-primary">cloud_upload</span>
                                </div>
                                <p className="text-[13px] font-[600] text-on-surface mb-1">Drop or browse</p>
                                <p className="text-[11px] text-outline-variant">Images & videos up to 50MB</p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                {mediaType === 'video' ? (
                                    <video src={mediaPreview} className="w-full h-full object-cover" muted />
                                ) : (
                                    <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                                )}
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 60%, rgba(11,19,38,0.8))' }}></div>
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <span className="chip text-[9px]">{mediaType}</span>
                                    <span className="text-[10px] text-on-surface-variant font-[600]">{formatSize(mediaFile.size)}</span>
                                </div>
                                <button onClick={clearMedia} className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-canvas/60 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        )}

                        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])} />
                    </div>

                    {/* Actions */}
                    <div className="card-l2 p-6 space-y-3" style={{ borderRadius: '1.5rem' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title.trim() || !content.trim()}
                            className={`w-full py-3.5 btn-primary text-[15px] cursor-pointer ${loading || !title.trim() || !content.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                            style={{ borderRadius: '0.75rem' }}
                        >
                            {loading ? 'Saving...' : 'Create Post'}
                        </button>
                        <button onClick={() => navigate('/')} className="w-full py-3 btn-ghost text-[14px] font-[600] cursor-pointer" style={{ borderRadius: '0.75rem' }}>
                            Discard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
