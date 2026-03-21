import React from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-panel max-w-sm w-full p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                        <LogOut className="w-7 h-7 text-red-500" />
                    </div>
                    
                    <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight">Sign Out</h3>
                    <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                        Are you sure you want to sign out? You'll need to log back in to participate in the community!
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[15px] transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                        >
                            Yes, Sign Out
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-[15px] transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>

                    <p className="mt-6 text-[12px] text-slate-500 font-medium uppercase tracking-widest italic opacity-50">
                        Stay clear, stay crystal.
                    </p>
                </div>
            </div>
        </div>
    );
}
