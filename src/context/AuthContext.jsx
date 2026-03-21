import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const navigate = useNavigate();

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    useEffect(() => {
        const handleUnauthorized = () => {
            setIsAuthModalOpen(true);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
        };
        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    useEffect(() => {
        // Check for token on mount and validate
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setUser(null);
                } else {
                    // Use stored username if available, otherwise fallback to token
                    setUser({
                        username: storedUsername || decoded.username || decoded.sub || 'User',
                        ...decoded
                    });
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        // Handle both object { authenticationToken, username } and string token
        const token = typeof data === 'string' ? data : (data.authenticationToken || data.token);
        const username = typeof data === 'object' ? data.username : null;

        if (!token) {
            console.error("Login failed: No token received");
            return;
        }

        localStorage.setItem('token', token);
        if (username) {
            localStorage.setItem('username', username);
        }

        try {
            const decoded = jwtDecode(token);
            setUser({
                username: username || decoded.username || decoded.sub || 'User',
                ...decoded
            });
            closeAuthModal();
            navigate('/');
            
            window.dispatchEvent(new CustomEvent('app-toast', { 
                detail: { message: `Welcome ${username || decoded.username || decoded.sub || 'User'}!`, type: 'success' } 
            }));
        } catch (error) {
            console.error("Login failed: Invalid token received");
            // Handle error appropriately, maybe clear token if invalid
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthModalOpen, openAuthModal, closeAuthModal }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
