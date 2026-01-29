import api from './axios';

export const authService = {
    register: (registerRequest) => api.post('/auth/register', registerRequest),
    login: (loginRequest) => api.post('/auth/login', loginRequest),
};

export const postService = {
    getAllPosts: () => api.get('/posts').then(res => res.data),
    getPostById: (id) => api.get(`/posts/${id}`).then(res => res.data),
    createPost: (createPostRequest) => api.post('/posts', createPostRequest).then(res => res.data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    vote: (postId, voteType) => api.post(`/posts/${postId}/votes`, { voteType }).then(res => res.data),
};

export const commentService = {
    getCommentsByPostId: (postId, page = 0, size = 10) =>
        api.get(`/comments/post/${postId}?page=${page}&size=${size}`).then(res => res.data),
    addComment: (postId, content) =>
        api.post(`/comments/post/${postId}`, { content }).then(res => res.data),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const userService = {
    getCurrentUser: () => api.get('/users').then(res => res.data),
    getUserPosts: () => api.get('/users/posts').then(res => res.data),
    deleteUserPost: (id) => api.delete(`/users/posts/${id}`),
};
