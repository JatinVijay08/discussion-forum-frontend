import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PenSquare, LogIn, UserPlus, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide search on login and register pages
  const hideSearch = ['/login', '/register'].includes(location.pathname);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBackground = isScrolled
    ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/5 shadow-lg'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                  <span className="text-orange-500 font-bold text-xl font-display">F</span>
                </div>
              </div>
              <span className="text-xl font-bold hidden sm:block text-zinc-200 tracking-tight group-hover:text-white transition-colors">
                Forum
              </span>
            </Link>
          </div>

          {/* Search Bar - Conditional Rendering */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8 transform transition-all duration-300">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-full leading-5 text-zinc-300 placeholder-zinc-500 
                           focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 
                           hover:bg-zinc-900/80 hover:border-white/10
                           transition-all duration-300 ease-out sm:text-sm shadow-inner"
                  placeholder="Search discussions..."
                />
              </div>
            </div>
          )}

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 group"
                >
                  <PenSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">Create</span>
                </Link>

                <div className="h-5 w-px bg-white/10 mx-1"></div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:border-orange-500/30 hover:shadow-orange-500/10 hover:scale-105"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-900/20 group-hover:from-orange-400 group-hover:to-amber-500">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-zinc-300 group-hover:text-white transition-colors">{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-zinc-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="relative px-6 py-2.5 bg-zinc-100 text-black rounded-full font-bold text-sm hover:bg-white transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] overflow-hidden group"
                >
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Visible valid for logic if we added mobile menu, 
              but for now ensuring layout doesn't break. 
              Keeping it modest means handling responsiveness gracefully. */}
          <div className="flex md:hidden items-center ml-4">
            {/* Simple mobile placeholder or menu toggle could go here if requested, 
                 but for now strictly following the design request for the existing items. */}
          </div>
        </div>
      </div>
    </nav>
  );
}
