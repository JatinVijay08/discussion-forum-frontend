import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoutModal from './LogoutModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const hideSearch = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 nav-border-animate ${
        isScrolled ? 'glass scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[80rem] mx-auto px-8 md:px-12 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-canvas">album</span>
            </div>
            <span className="text-[18px] font-[800] text-on-surface tracking-tight">
              Discussion Forum
            </span>
          </Link>

          {/* Search */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 justify-center mx-12">
              <div className="relative w-full max-w-[420px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 obsidian-input rounded-xl text-[14px] font-[500]"
                  placeholder="Search discussions..."
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="btn-ghost btn-pill flex items-center gap-2 px-4 py-2 text-[13px] font-[700] hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  Create Post
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-surface-high/40 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-canvas font-[800] text-[13px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[14px] font-[600] text-on-surface">{user.username}</span>
                </Link>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-surface-high/30 transition-colors duration-200 cursor-pointer"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </>
            ) : (
              <>
                {hideSearch ? (
                  <Link
                    to="/explore"
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-[700] text-on-surface-variant hover:text-white transition-colors border border-outline-variant/30 hover:bg-surface-high/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    Browse Posts
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-on-surface-variant hover:text-on-surface font-[600] text-[14px] px-4 py-2 transition-colors duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary btn-pill cta-glow px-5 py-2 text-[13px]"
                    >
                      Join Forum
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile placeholder */}
          <div className="flex md:hidden items-center"></div>
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
