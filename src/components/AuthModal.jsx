import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuth();
    const navigate = useNavigate();

    if (!isAuthModalOpen) return null;

    const handleAction = (path) => {
        closeAuthModal();
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 atelier-overlay" style={{ justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20vh' }}>
            <div className="atelier-panel max-w-sm w-full p-8 relative" style={{ borderRadius: '1.5rem' }}>
                {/* Close */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high/30 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[24px] text-canvas">diamond</span>
                    </div>

                    <h3 className="text-[1.5rem] font-[700] text-on-surface tracking-tight mb-2">
                        Join the Forum
                    </h3>
                    <p className="text-[14px] text-on-surface-variant leading-[1.7] mb-8">
                        Sign in to join the conversation and participate.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleAction('/login')}
                            className="w-full py-3.5 btn-primary text-[15px] cursor-pointer flex items-center justify-center gap-2"
                            style={{ borderRadius: '0.75rem' }}
                        >
                            Sign In
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>

                        <button
                            onClick={() => handleAction('/register')}
                            className="w-full py-3.5 btn-secondary text-[15px] cursor-pointer"
                            style={{ borderRadius: '0.75rem' }}
                        >
                            Create Account
                        </button>
                    </div>

                    <p className="mt-6 label-meta text-[9px] text-outline-variant text-center">
                        Discussion Forum
                    </p>
                </div>
            </div>
        </div>
    );
}
