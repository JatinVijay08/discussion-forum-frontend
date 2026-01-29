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
        <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">


            <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform hover:rotate-3 transition-all duration-300">
                        <span className="text-white font-bold text-3xl">F</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        Or{' '}
                        <Link to="/register" className="font-semibold text-orange-400 hover:text-orange-500 transition-colors">
                            create a new account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1 pl-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-zinc-500 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-zinc-900 transition-all sm:text-sm shadow-xs cursor-text"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1 pl-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-zinc-500 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-zinc-900 transition-all sm:text-sm shadow-xs cursor-text"
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
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-300 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 cursor-pointer">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange-500/20 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
