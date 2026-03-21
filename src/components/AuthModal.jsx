import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuth();
    const navigate = useNavigate();

    if (!isAuthModalOpen) return null;

    const handleAction = (path) => {
        closeAuthModal();
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-panel max-w-sm w-full p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/10">
                {/* Close Button */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                        <div className="w-6 h-6 bg-white rounded-md rotate-45"></div>
                    </div>
                    
                    <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight">Join the Conversation</h3>
                    <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                        Upvoting, downvoting, and commenting are exclusive features for community members. Sign in to participate!
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleAction('/login')}
                            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white rounded-full font-bold text-[15px] transition-all shadow-lg shadow-accent/20 cursor-pointer flex items-center justify-center gap-2 group"
                        >
                            Sign In
                            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button
                            onClick={() => handleAction('/register')}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-[15px] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Account
                        </button>
                    </div>

                    <p className="mt-6 text-[12px] text-slate-500 font-medium uppercase tracking-widest">
                        GlassForum Crystal Clear UI
                    </p>
                </div>
            </div>
        </div>
    );
}
