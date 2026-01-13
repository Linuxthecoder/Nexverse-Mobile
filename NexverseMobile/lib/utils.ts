import { API_URL } from './axios';

// Get full image URL
export const getImageUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;
    if (path === '/avatar.png') return undefined; // Handle backend fallback that isn't served

    // Handle specific localhost case for Android
    if (path.startsWith('http://localhost') || path.startsWith('http://127.0.0.1') || path.startsWith('https://localhost')) {
        if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
            // If API_URL is also localhost, we might be on iOS or configured that way, let it pass
            // But if we are on Android, we likely want 10.0.2.2
            // Actually, safer to just replace the origin with API_URL's origin if it exists
        }

        // Replace localhost/127.0.0.1 with the configured API URL origin
        // This ensures that if the backend sends "http://localhost:5001/img.jpg"
        // and our app is configured to use "http://10.0.2.2:5001", we convert it.
        return path.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_URL);
    }

    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path; // Base64
    if (path.startsWith('file://')) return path; // Local file

    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_URL}/${cleanPath}`;
};

// Format message timestamp
export const formatMessageTime = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (hours > 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
};

// Format last seen time
export const formatLastSeen = (lastSeen: string | Date | null): string => {
    if (!lastSeen) return 'Never';

    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
};

// Format message status
export const formatMessageStatus = (status: string): string => {
    switch (status) {
        case 'sending':
            return '⏱';
        case 'sent':
            return '✓';
        case 'delivered':
            return '✓✓';
        case 'seen':
            return '✓✓'; // Will be styled blue in component
        case 'error':
            return '⚠';
        default:
            return '';
    }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
