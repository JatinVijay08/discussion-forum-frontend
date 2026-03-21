import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000, title = null, details = null) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration, title, details }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Global event listener for errors
    useEffect(() => {
        const handleGlobalToast = (event) => {
            const { message, type, duration, title, details } = event.detail;
            addToast(message, type, duration, title, details);
        };
        window.addEventListener('app-toast', handleGlobalToast);
        return () => window.removeEventListener('app-toast', handleGlobalToast);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ message, type, duration, title, details, onRemove }) => {
    useEffect(() => {
        // Increase duration if there are details to read
        const displayDuration = details ? Math.max(duration || 5000, 7000) : (duration || 5000);
        const timer = setTimeout(onRemove, displayDuration);
        return () => clearTimeout(timer);
    }, [duration, details, onRemove]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-rose-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    const styles = {
        success: 'border-emerald-500/20 bg-emerald-500/5',
        error: 'border-rose-500/20 bg-rose-500/5',
        warning: 'border-amber-500/20 bg-amber-500/5',
        info: 'border-blue-500/20 bg-blue-500/5',
    };

    return (
        <div className={`pointer-events-auto flex items-start gap-3 p-4 glass-panel border rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 ${styles[type]}`}>
            <div className="shrink-0 pt-0.5">{icons[type]}</div>
            <div className="flex-1 min-w-0">
                {title && <h4 className="text-[14px] font-bold text-white mb-0.5">{title}</h4>}
                <p className={`text-[13px] font-medium text-slate-300 leading-relaxed break-words ${!title ? 'text-white text-[14px]' : ''}`}>
                    {message}
                </p>
                {details && details.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {details.map((detail, idx) => (
                            <p key={idx} className="text-[12px] text-rose-400/90 font-medium">
                                {detail}
                            </p>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={onRemove}
                className="shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
