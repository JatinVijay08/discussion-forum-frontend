import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        setLoading(true);

        try {
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response) {
                alert(`Registration failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Registration failed: Network Error or Server Unreachable');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform hover:rotate-3 transition-all duration-300">
                        <span className="text-white font-bold text-3xl">P</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-500 transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-5 relative" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1 pl-1">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-zinc-500 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-zinc-900 transition-all sm:text-sm shadow-xs cursor-text"
                                placeholder="Display Name"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1 pl-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
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
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1 pl-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-zinc-500 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-zinc-900 transition-all sm:text-sm shadow-xs cursor-text"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange-500/20 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
