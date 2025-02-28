const API_BASE_URL = 'https://ranjanlive.pythonanywhere.com/api';

// Session management
const SessionManager = {
    saveSession: function(token, username) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', username);
    },
    
    getSession: function() {
        return {
            token: localStorage.getItem('authToken'),
            username: localStorage.getItem('username')
        };
    },
    
    clearSession: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
    },
    
    isLoggedIn: function() {
        return !!localStorage.getItem('authToken');
    }
};

// CSRF token management
const CSRFManager = {
    getToken: function() {
        return localStorage.getItem('csrfToken');
    },
    
    setToken: function(token) {
        localStorage.setItem('csrfToken', token);
    },
    
    includeToken: function(headers) {
        const token = this.getToken();
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
        return headers;
    }
};

// API client for authentication with improved error handling
const AuthAPI = {
    login: async function(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response. Please check server logs.");
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            SessionManager.saveSession(data.token, data.username);
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },
    
    signup: async function(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password })
            });
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response. Please check server logs.");
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            SessionManager.saveSession(data.token, data.username);
            return data;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    },
    
    logout: function() {
        SessionManager.clearSession();
    }
};

// API client for file operations
const FileAPI = {
    listFiles: async function(directory = '') {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/files?dir=${encodeURIComponent(directory)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to list files');
        }
        
        return await response.json();
    },
    
    uploadFile: async function(file, directory = '') {
        const { token } = SessionManager.getSession();
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('dir', directory);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        
        return await response.json();
    },
    
    downloadFile: function(filePath) {
        const { token } = SessionManager.getSession();
        const downloadUrl = `${API_BASE_URL}/download?path=${encodeURIComponent(filePath)}`;
        
        // Create a hidden link and click it to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add auth token to the link
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        
        // Use fetch to get the file with authorization
        fetch(downloadUrl, {
            headers: headers
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filePath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    },
    
    deleteItem: async function(path) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Delete failed');
        }
        
        return await response.json();
    },
    
    createFolder: async function(name, path = '') {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/mkdir`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, path })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create folder');
        }
        
        return await response.json();
    },
    
    renameItem: async function(oldPath, newName) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/rename`, {
            method: 'PUT',
            headers: CSRFManager.includeToken({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ oldPath, newName })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to rename item');
        }
        
        return await response.json();
    },
    
    searchFiles: async function(query) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Search failed');
        }
        
        return await response.json();
    },
    
    shareItem: async function(path, shareWith) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/share`, {
            method: 'POST',
            headers: CSRFManager.includeToken({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ path, shareWith })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to share item');
        }
        
        return await response.json();
    },
    
    toggleFavorite: async function(path) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/favorite`, {
            method: 'POST',
            headers: CSRFManager.includeToken({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ path })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update favorites');
        }
        
        return await response.json();
    },
    
    listFavorites: async function() {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to list favorites');
        }
        
        return await response.json();
    },
    
    isItemFavorite: async function(path) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check favorite status');
        }
        
        const data = await response.json();
        return data.favorites.includes(path);
    },
    
    getItemInfo: async function(path) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/files/info?path=${encodeURIComponent(path)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get item info');
        }
        
        return await response.json();
    },
    
    listTrash: async function() {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/trash`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to list trash');
        }
        
        return await response.json();
    },
    
    restoreFromTrash: async function(itemName) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/trash/restore`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: itemName })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to restore item');
        }
        
        return await response.json();
    },
    
    permanentDelete: async function(itemName) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/trash/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: itemName })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete item');
        }
        
        return await response.json();
    },
    
    listRecent: async function() {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/recent`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to list recent files');
        }
        
        return await response.json();
    },
    
    checkFavoriteStatus: async function(path) {
        const { token } = SessionManager.getSession();
        
        const response = await fetch(`${API_BASE_URL}/files/info?path=${encodeURIComponent(path)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check favorite status');
        }
        
        const data = await response.json();
        return data.isFavorite;
    }
};

// Utility functions
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const showMessage = (message, type = 'info') => {
    // You can implement a toast or notification system here
    alert(message);
};

// Helper for redirection
const redirectToLogin = () => {
    window.location.href = 'login_signup.html';
};

const redirectToDashboard = () => {
    window.location.href = 'index.html';
};