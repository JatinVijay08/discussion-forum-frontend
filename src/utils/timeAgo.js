export const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        let val = Math.floor(interval);
        return val + (val === 1 ? ' year ago' : ' years ago');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        let val = Math.floor(interval);
        return val + (val === 1 ? ' month ago' : ' months ago');
    }
    interval = seconds / 86400;
    if (interval >= 1) {
        let val = Math.floor(interval);
        return val + (val === 1 ? ' day ago' : ' days ago');
    }
    interval = seconds / 3600;
    if (interval >= 1) {
        let val = Math.floor(interval);
        return val + (val === 1 ? ' hr ago' : ' hrs ago');
    }
    interval = seconds / 60;
    if (interval >= 1) {
        let val = Math.floor(interval);
        return val + (val === 1 ? ' min ago' : ' mins ago');
    }
    if (seconds < 10) return 'just now';
    return Math.floor(seconds) + ' sec ago';
};
