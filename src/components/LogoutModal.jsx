import React from 'react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 atelier-overlay" style={{ justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20vh' }}>
            <div className="atelier-panel max-w-sm w-full p-8 relative" style={{ borderRadius: '1.5rem' }}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high/30 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <div>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255, 180, 171, 0.1)' }}>
                        <span className="material-symbols-outlined text-[24px] text-error">logout</span>
                    </div>

                    <h3 className="text-[1.5rem] font-[700] text-on-surface tracking-tight mb-2">
                        Leave the Gallery?
                    </h3>
                    <p className="text-[14px] text-on-surface-variant leading-[1.7] mb-8">
                        You'll need to sign in again to curate and participate.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3.5 text-[15px] font-[800] cursor-pointer text-canvas"
                            style={{ borderRadius: '0.75rem', background: 'linear-gradient(to right, #ff8a80, #ffb4ab)' }}
                        >
                            Sign Out
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 btn-secondary text-[15px] cursor-pointer"
                            style={{ borderRadius: '0.75rem' }}
                        >
                            Stay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
