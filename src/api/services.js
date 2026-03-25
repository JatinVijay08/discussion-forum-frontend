import api from './axios';

export const authService = {
    register: (registerRequest) => api.post('/auth/register', registerRequest),
    login: (loginRequest) => api.post('/auth/login', loginRequest),
    googleLogin: (idToken) => api.post('/auth/google', { idToken }),
};

export const postService = {
    getAllPosts: (sort = 'new', limit = 10, cursor = null) => api.get('/posts', { params: { sort, limit, cursor } }).then(res => res.data),
    getPostById: (id) => api.get(`/posts/${id}`).then(res => res.data),
    createPost: (createPostRequest) => api.post('/posts', createPostRequest).then(res => res.data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    vote: (postId, voteType) => api.post(`/posts/${postId}/votes`, { voteType }).then(res => res.data),
};

export const commentService = {
    getCommentsByPostId: (postId, page = 0, size = 10) =>
        api.get(`/comments/post/${postId}?page=${page}&size=${size}`).then(res => res.data),
    addComment: (postId, content, parentId = null) =>
        api.post(`/comments/post/${postId}`, { content, parentId }).then(res => res.data),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
    voteOnComment: (commentId, voteType) => api.post(`/comments/${commentId}/votes`, { voteType }).then(res => res.data),
};

export const userService = {
    getCurrentUser: () => api.get('/users').then(res => res.data),
    getUserPosts: (sort = 'new') => api.get('/users/posts', { params: { sort } }).then(res => res.data),
    deleteUserPost: (id) => api.delete(`/users/posts/${id}`),
    updateUsername: (username) => api.patch('/users/username', { username }).then(res => res.data),
};
