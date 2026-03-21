import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';
import { GoogleLogin } from '@react-oauth/google';


export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.login(formData);
            login(response.data);
        } catch (error) {
            // Error is handled by global interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full bg-bg-base overflow-hidden flex items-center justify-center pt-16 pb-4 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-[420px] w-full space-y-4 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden z-10">
                <div className="relative">
                    <h2 className="text-center text-[32px] font-bold text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-[15px] text-slate-400">
                        Join the crystal clear community conversation.
                    </p>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mt-4 mb-2">
                        <div className="w-1/2 text-center py-2 border-b-2 border-accent text-white font-semibold text-[15px]">
                            Login
                        </div>
                        <Link to="/register" className="w-1/2 text-center py-2 text-slate-400 hover:text-white font-medium text-[15px] transition-colors">
                            Register
                        </Link>
                    </div>
                </div>


                <form className="mt-4 space-y-4 relative" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-[12px] font-bold text-slate-400 mb-2 pl-1 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                className="appearance-none block w-full px-4 py-2.5 glass-input rounded-2xl focus:bg-white/10 text-[15px] shadow-inner"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 pl-1">
                                <label htmlFor="password" className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                    Password
                                </label>
                                <a href="#" className="font-semibold text-accent hover:text-blue-400 cursor-pointer transition-colors text-[12px]">
                                    FORGOT?
                                </a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="appearance-none block w-full px-4 py-2.5 glass-input rounded-2xl focus:bg-white/10 text-[15px] shadow-inner font-mono tracking-widest"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center mt-1">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 bg-white/5 border border-white/20 rounded accent-accent cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-[13px] text-slate-400 cursor-pointer">
                            Stay signed in for 30 days
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group w-full flex justify-center items-center gap-2 py-3 px-4 text-[16px] font-bold rounded-full text-white bg-accent hover:bg-accent-hover transition-all active:scale-[0.98] shadow-lg shadow-accent/25 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : (
                                <>
                                    Sign In 
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                        <span className="px-3 bg-surface rounded-full border border-white/5">Or continue with</span>
                    </div>
                </div>

                <div className="mt-4 flex justify-center gap-4">
                    <div className="flex items-center justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    const res = await authService.googleLogin(credentialResponse.credential);
                                    login(res.data);
                                } catch (error) {
                                    console.error('Google Login Error:', error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                console.error('Login Failed');
                            }}
                            type="icon"
                            theme="filled_black"
                            shape="circle"
                            size="large"
                        />
                    </div>
                    {/* Apple Button */}
                    <button type="button" className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.94 1.16-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.648 2.597-4.72-1.541-2.252-3.934-2.56-4.78-2.617-1.554-.104-3.277 1.026-4.21 1.026zM15.006 4.604c.834-1.022 1.396-2.441 1.242-3.847-1.19.05-2.73 1.066-3.585 2.073-.76.873-1.433 2.324-1.258 3.7-.015.01-.03.02-.045.03 1.245.043 2.812-.934 3.646-1.956z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
