import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RecentUsersWidget() {
    const navigate = useNavigate();
    const { user: authUser, openAuthModal } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await api.get('/users/recent');
                const data = response.data;
                const userList = Array.isArray(data) ? data : [];
                setUsers(userList.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch recent users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <div className="card-l2 p-6" style={{ borderRadius: '1.5rem' }}>
            <h3 className="label-meta text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">group</span>
                Recently Logged In Users
            </h3>

            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : users.length === 0 ? (
                <p className="text-[13px] text-on-surface-variant italic">No users recently active.</p>
            ) : (
                <div className="flex flex-col gap-5">
                    {users.map((user, index) => (
                        <div
                            key={user.email || index}
                            className="group flex flex-col gap-1"
                        >
                            <h4 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!authUser) {
                                        openAuthModal();
                                        return;
                                    }
                                    navigate(`/user/${user.username}`); 
                                }}
                                className="text-[13px] font-[600] text-on-surface leading-snug hover:text-primary transition-colors cursor-pointer hover:underline"
                            >
                                {user.username || 'user'}
                            </h4>
                            <div className="label-meta text-[11px] text-outline-variant">
                                {user.email}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
