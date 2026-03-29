import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <ToastProvider>
      <div className="min-h-screen font-manrope text-on-surface transition-colors duration-300" style={{ fontFamily: "'Manrope', sans-serif" }}>
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
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
