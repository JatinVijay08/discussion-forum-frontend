import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState('');

    const handleGoogleRedirectClick = () => {
        const clientId = '450258133865-irr7v1o53jss1dptndhoma703j8ea0hm.apps.googleusercontent.com';
        const redirectUri = window.location.origin;
        const scope = 'openid email profile';
        const responseType = 'id_token';
        const nonce = Math.random().toString(36).substring(2);
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${nonce}&prompt=select_account`;
        window.location.href = url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Passwords don't match", type: 'warning' } }));
            return;
        }
        if (!formData.username || formData.username.length < 3) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Username must be at least 3 characters", type: 'warning' } }));
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Please enter a valid email address", type: 'warning' } }));
            return;
        }
        setLoading(true);
        try {
            await authService.register({ username: formData.username, email: formData.email, password: formData.password });
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            // Handled by global interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0b1326]">
            {/* Left Pane - Editorial Banner */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: "url('/discussion-forum-hero.png')",
                        filter: "brightness(0.9) contrast(1.1) hue-rotate(10deg)" 
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-canvas/80 via-transparent to-canvas/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-80" />
                </div>

                {/* Top Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-canvas">album</span>
                    </div>
                    <span className="text-[20px] font-[800] text-white tracking-tight">Discussion Forum</span>
                </div>

                {/* Glassmorphic Motivation Card */}
                <div className="relative z-10 w-full max-w-[480px] p-10 rounded-3xl glass ghost-border shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="text-[2.25rem] font-[800] text-white leading-[1.1] mb-5 tracking-tight">
                        Join the community.
                    </h2>
                    <p className="text-[1.05rem] text-on-surface-variant leading-[1.6] font-[500]">
                        Create an account to start sharing and discussing ideas.
                    </p>
                </div>

                {/* Bottom Label */}
                <div className="relative z-10">
                    <p className="label-meta text-[9px] tracking-[0.2em] text-on-surface-variant mb-1">DISCUSSION FORUM</p>
                    <p className="text-[14px] text-white/80 font-[500]">Community Platform</p>
                </div>
            </div>

            {/* Right Pane - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative h-screen overflow-y-auto w-full">
                {/* Browse Discussions Link */}
                <Link to="/explore" className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-[700] text-on-surface-variant hover:text-white transition-colors border border-outline-variant/30 hover:bg-surface-high/30 z-50">
                    <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                    Browse Posts
                </Link>

                {/* Mobile Logo Fallback */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3 z-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-canvas">album</span>
                    </div>
                    <span className="text-[20px] font-[800] text-white tracking-tight">Discussion Forum</span>
                </div>

                <div className="w-full max-w-[400px] mt-20 lg:mt-0">
                    {success ? (
                        <div className="text-center py-16 animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
                            </div>
                            <h2 className="text-[1.5rem] font-[800] text-white tracking-tight mb-2">Welcome to Discussion Forum</h2>
                            <p className="text-on-surface-variant text-[14px] font-[500]">{success}</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-[2rem] font-[800] text-white tracking-tight mb-2">Join the Network</h1>
                            <p className="text-[15px] font-[500] text-on-surface-variant mb-10">Sign up to start a discussion</p>

                            {/* Social Logins */}
                            <div className="mb-10 flex justify-center w-full">
                                <div 
                                    className="relative w-full h-[52px] rounded-xl overflow-hidden bg-surface-low border border-white/5 hover:bg-surface-high/50 transition-colors group cursor-pointer"
                                    onClick={handleGoogleRedirectClick}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
                                        <svg width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                        </svg>
                                        <span className="text-[13px] font-[700] text-white tracking-wide">Continue with Google</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-10">
                                <div className="flex-1 h-px bg-outline-variant/30"></div>
                                <span className="text-[10px] font-[800] tracking-[0.15em] text-outline-variant uppercase">Or Register With Email</span>
                                <div className="flex-1 h-px bg-outline-variant/30"></div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-[800] tracking-[0.1em] uppercase text-on-surface-variant block mb-2 px-1">Display Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-surface-lowest border border-white/5 text-white text-[15px] font-[500] rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                        placeholder="Your alias"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-[800] tracking-[0.1em] uppercase text-on-surface-variant block mb-2 px-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-3.5 bg-surface-lowest border border-white/5 text-white text-[15px] font-[500] rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                        placeholder="name@discussion-forum.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-[800] tracking-[0.1em] uppercase text-on-surface-variant block mb-2 px-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full px-5 py-3.5 bg-surface-lowest border border-white/5 text-white text-[15px] font-[500] font-mono tracking-widest rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <span 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant cursor-pointer hover:text-white transition-colors"
                                            >
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-[800] tracking-[0.1em] uppercase text-on-surface-variant block mb-2 px-1">Confirm</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="w-full px-5 py-3.5 bg-surface-lowest border border-white/5 text-white text-[15px] font-[500] font-mono tracking-widest rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                            <span 
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant cursor-pointer hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 bg-primary text-[#0b1326] text-[15px] font-[800] rounded-xl cta-glow transform hover:-translate-y-0.5 duration-200 mt-4 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                            
                            <div className="mt-8 text-center text-[12px] font-[600] tracking-wide text-on-surface-variant">
                                Already joined?{' '}
                                <Link to="/login" className="text-white hover:text-primary transition-colors uppercase tracking-[0.1em]">Sign In</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
