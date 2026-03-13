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
    ? 'bg-surface/90 backdrop-blur-sm border-b border-border-subtle shadow-none'
    : 'bg-surface border-b border-border-subtle';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 h-[48px] transition-all duration-300 ease-in-out ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-[15px] font-semibold text-accent tracking-tight transition-colors">
                Nexus
              </span>
            </Link>
          </div>

          {/* Search Bar - Conditional Rendering */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 justify-center mx-8">
              <div className="relative w-full max-w-[480px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-[14px] w-[14px] text-text-muted transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-4 py-1.5 bg-bg-base border border-[rgba(255,255,255,0.1)] rounded-[20px] text-[13px] text-text-primary placeholder-text-muted 
                           focus:outline-none focus:border-accent
                           hover:border-[rgba(255,255,255,0.2)] transition-all duration-300"
                  placeholder="Search discussions..."
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
                  <span className="font-medium text-[12px]">Create</span>
                </Link>

                <div className="h-4 w-px bg-border-subtle mx-1"></div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-elevated transition-all duration-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white font-medium text-[11px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[12px] text-text-primary">{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-bg-elevated rounded-md transition-all duration-200"
                  title="Log Out"
                >
                  <LogOut className="w-[14px] h-[14px]" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-muted hover:text-text-primary font-medium text-[12px] px-2 transition-colors"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="bg-accent text-white rounded-[6px] font-medium text-[12px] px-[16px] py-[6px] hover:bg-accent-light transition-colors"
                >
                  Sign in
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
