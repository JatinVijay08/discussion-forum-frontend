import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';


export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(formData);
            login(response.data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                setError('Invalid email or password');
            } else if (error.response) {
                setError(error.response.data.message || 'Login failed. Please try again.');
            } else if (error.request) {
                setError('Unable to connect to server. Check your internet or try again later.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-screen bg-bg-base overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-[400px] w-full space-y-6 bg-surface p-8 sm:p-10 rounded-[16px] border-[0.5px] border-border-subtle shadow-none relative overflow-hidden z-10">
                <div className="relative">
                    <div className="mx-auto h-12 w-12 bg-accent/20 rounded-xl flex items-center justify-center shadow-none mb-6">
                        <span className="text-white font-bold text-2xl font-display">F</span>
                    </div>
                    <h2 className="text-center text-[24px] font-semibold text-text-main tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-[14px] text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-text-primary hover:text-accent-light transition-colors underline underline-offset-4">
                            Sign up
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-5 relative" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-medium text-text-secondary mb-1.5 pl-1 shrink-0">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-2.5 border-[0.5px] border-border-subtle placeholder-text-muted text-text-primary rounded-[10px] focus:outline-none focus:border-accent bg-bg-base/50 transition-all text-[14px] shadow-none cursor-text hover:border-[rgba(255,255,255,0.2)]"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-[13px] font-medium text-text-secondary mb-1.5 pl-1 shrink-0">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-2.5 border-[0.5px] border-border-subtle placeholder-text-muted text-text-primary rounded-[10px] focus:outline-none focus:border-accent bg-bg-base/50 transition-all text-[14px] shadow-none cursor-text hover:border-[rgba(255,255,255,0.2)]"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-accent focus:ring-accent border-border-subtle rounded cursor-pointer bg-bg-base"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-[13px] text-text-secondary cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <div className="text-[13px]">
                            <a href="#" className="font-medium text-text-primary hover:text-accent-light cursor-pointer transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-[10px] px-4 border border-transparent text-[14px] font-medium rounded-[10px] text-white bg-accent hover:bg-accent-light focus:outline-none transition-all active:scale-[0.98] shadow-none cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border-subtle"></div>
                    </div>
                    <div className="relative flex justify-center text-[12px] font-medium">
                        <span className="px-2 bg-surface text-text-secondary">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-[8px] border-[0.5px] border-border-subtle rounded-[10px] text-text-primary text-[13px] font-medium hover:bg-elevated transition-colors cursor-pointer">
                        <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-[8px] border-[0.5px] border-border-subtle rounded-[10px] text-text-primary text-[13px] font-medium hover:bg-elevated transition-colors fill-current cursor-pointer">
                        <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
