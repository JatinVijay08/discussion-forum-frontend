import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen font-sans text-white transition-colors duration-300">
        <Navbar />
        <AuthModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
