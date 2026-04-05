import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import { authService } from './api/services';
import { useEffect, useRef, useState } from 'react';

// Capture the hash before React Router has a chance to clear it on `<Navigate>`
const initialHash = window.location.hash;

function App() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  const hashProcessed = useRef(false);
  const tempHash = window.location.hash || initialHash;
  const hasTokenInitially = tempHash.includes('id_token=');
  const [isGoogleLoading, setIsGoogleLoading] = useState(hasTokenInitially);

  useEffect(() => {
    const hash = window.location.hash || initialHash;
    if (!hashProcessed.current && hash && hash.includes('id_token=')) {
      hashProcessed.current = true;
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      if (idToken) {
        // Clear hash to prevent replay issues
        window.history.replaceState(null, null, window.location.pathname);
        authService.googleLogin(idToken).then(res => {
          login(res.data);
          setIsGoogleLoading(false);
          navigate('/explore');
        }).catch(err => {
          console.error("Google login redirect error", err);
          setIsGoogleLoading(false);
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Google login failed", type: 'error' } }));
        });
      } else {
        setIsGoogleLoading(false);
      }
    }
  }, [login, navigate]);

  return (
    <ToastProvider>
      <div className="min-h-screen font-manrope text-on-surface transition-colors duration-300" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {isGoogleLoading ? (
          <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0b1326] absolute inset-0 z-50">
            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-primary animate-spin mb-6"></div>
            <h2 className="text-[1.5rem] font-[800] text-white tracking-tight mb-2">Authenticating</h2>
            <p className="text-on-surface-variant text-[14px] font-[500]">Please wait while we log you in...</p>
          </div>
        ) : (
          <>
            {!hideNavbar && <Navbar />}
            <AuthModal />
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/explore" : "/login"} replace />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/login" element={user ? <Navigate to="/explore" replace /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/explore" replace /> : <Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <ProtectedRoute>
                    <PublicProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route path="/post/:id" element={<PostDetail />} />
            </Routes>
          </>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
