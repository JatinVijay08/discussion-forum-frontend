import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PenSquare, LogIn, UserPlus, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoutModal from './LogoutModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    ? 'bg-surface/80 backdrop-blur-md border-b border-white/10 shadow-lg'
    : 'bg-transparent border-b border-transparent';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 h-[64px] transition-all duration-300 ease-in-out ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 shadow-lg shadow-blue-500/20">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div>
              </div>
              <span className="text-[18px] font-bold text-white tracking-tight transition-colors">
                GlassForum
              </span>
            </Link>
          </div>

          {/* Search Bar - Conditional Rendering */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 justify-center mx-8">
              <div className="relative w-full max-w-[480px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-[16px] w-[16px] text-slate-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-[14px] text-white placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:bg-white/10
                           hover:border-white/20 transition-all duration-300 shadow-inner"
                  placeholder="Search communities, posts..."
                />
              </div>
            </div>
          )}

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-all duration-200"
                >
                  <PenSquare className="w-[14px] h-[14px]" />
                  <span className="font-medium text-[14px]">Create</span>
                </Link>

                <div className="h-4 w-px bg-border-subtle mx-1"></div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-elevated transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white font-bold text-[13px] shadow-md shadow-accent/20">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[14px] text-white">{user.username}</span>
                </Link>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-bg-elevated rounded-md transition-all duration-200 cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-[14px] h-[14px]" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium text-[14px] px-4 py-2 transition-colors"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="bg-accent text-white rounded-full font-medium text-[14px] px-[20px] py-[8px] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
                >
                  Join Now
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
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => {
            setIsLogoutModalOpen(false);
            logout();
        }} 
      />
    </nav>
  );
}
