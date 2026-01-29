// admin/js/data-loader.js - Data Loading and Management

class DataLoader {
    constructor() {
        this.postsData = null;
        this.usersData = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    // Initialize data loader
    init() {
        this.checkLocalStorage();
        this.setupAutoRefresh();
    }

    // Check if data exists in localStorage, load from JSON files if not
    checkLocalStorage() {
        // Check for posts data
        if (!localStorage.getItem('posts') || !localStorage.getItem('postsCategories')) {
            this.loadPostsFromFile();
        }

        // Check for users data
        if (!localStorage.getItem('adminUsers') || !localStorage.getItem('adminRoles')) {
            this.loadUsersFromFile();
        }

        // Check for activity logs
        if (!localStorage.getItem('adminActivityLogs')) {
            this.initializeActivityLogs();
        }
    }

    // Load posts data from JSON file
    async loadPostsFromFile() {
        try {
            // In a real application, this would fetch from the server
            // For demo purposes, we'll use the posts.json structure
            
            const demoPosts = [
                {
                    id: 'post_001',
                    title: 'Welcome to Our New Website',
                    slug: 'welcome-to-our-new-website',
                    category: 'announcements',
                    status: 'published',
                    excerpt: "We're excited to announce the launch of our brand new website with enhanced features and better user experience.",
                    content: "<h2>Welcome to Our New Online Home</h2><p>After months of hard work and dedication, we are thrilled to unveil our completely redesigned website...</p>",
                    tags: ['website', 'launch', 'announcement', 'update'],
                    author: 'Super Admin',
                    allowComments: true,
                    featured: true,
                    sticky: true,
                    createdAt: '2024-03-01T10:00:00Z',
                    updatedAt: '2024-03-01T10:00:00Z'
                },
                // More demo posts...
            ];

            const categories = [
                { id: 'cat_001', name: 'News', slug: 'news', postCount: 4 },
                { id: 'cat_002', name: 'Events', slug: 'events', postCount: 2 },
                { id: 'cat_003', name: 'Careers', slug: 'careers', postCount: 2 },
                { id: 'cat_004', name: 'Community', slug: 'community', postCount: 1 },
                { id: 'cat_005', name: 'Financial', slug: 'financial', postCount: 1 },
                { id: 'cat_006', name: 'Updates', slug: 'updates', postCount: 1 }
            ];

            const tags = [
                { name: 'website', count: 1 },
                { name: 'launch', count: 1 },
                { name: 'announcement', count: 2 },
                // More demo tags...
            ];

            // Save to localStorage
            localStorage.setItem('posts', JSON.stringify(demoPosts));
            localStorage.setItem('postsCategories', JSON.stringify(categories));
            localStorage.setItem('postsTags', JSON.stringify(tags));

            console.log('Posts data loaded from file');

            // Return the data
            return {
                posts: demoPosts,
                categories: categories,
                tags: tags
            };

        } catch (error) {
            console.error('Error loading posts from file:', error);
            return {
                posts: [],
                categories: [],
                tags: []
            };
        }
    }

    // Load users data from JSON file
    async loadUsersFromFile() {
        try {
            // Demo users data
            const demoUsers = [
                {
                    id: 'user_001',
                    username: 'superadmin',
                    email: 'superadmin@companyname.com',
                    password: 'admin123',
                    name: 'Super Admin',
                    role: 'superadmin',
                    status: 'active',
                    avatarColor: 'superadmin',
                    phone: '+1 (555) 123-4567',
                    permissions: ['posts', 'pages', 'media', 'users', 'settings', 'analytics'],
                    lastLogin: '2024-03-20T14:25:00Z',
                    createdAt: '2024-01-01T09:00:00Z',
                    updatedAt: '2024-03-20T14:25:00Z'
                },
                {
                    id: 'user_002',
                    username: 'admin',
                    email: 'admin@companyname.com',
                    password: 'admin123',
                    name: 'Admin User',
                    role: 'admin',
                    status: 'active',
                    avatarColor: 'admin',
                    phone: '+1 (555) 987-6543',
                    permissions: ['posts', 'pages', 'media', 'comments', 'analytics'],
                    lastLogin: '2024-03-19T11:30:00Z',
                    createdAt: '2024-02-01T10:00:00Z',
                    updatedAt: '2024-03-19T11:30:00Z'
                },
                // More demo users...
            ];

            const roles = [
                {
                    id: 'role_001',
                    name: 'superadmin',
                    displayName: 'Super Administrator',
                    permissions: ['posts', 'pages', 'media', 'users', 'settings', 'analytics']
                },
                {
                    id: 'role_002',
                    name: 'admin',
                    displayName: 'Administrator',
                    permissions: ['posts', 'pages', 'media', 'comments', 'analytics']
                },
                {
                    id: 'role_003',
                    name: 'editor',
                    displayName: 'Content Editor',
                    permissions: ['posts', 'media', 'comments']
                }
            ];

            // Save to localStorage
            localStorage.setItem('adminUsers', JSON.stringify(demoUsers));
            localStorage.setItem('adminRoles', JSON.stringify(roles));

            console.log('Users data loaded from file');

            return {
                users: demoUsers,
                roles: roles
            };

        } catch (error) {
            console.error('Error loading users from file:', error);
            return {
                users: [],
                roles: []
            };
        }
    }

    // Initialize activity logs
    initializeActivityLogs() {
        const activityLogs = [
            {
                id: 'log_001',
                userId: 'user_001',
                userName: 'Super Admin',
                action: 'System',
                description: 'Initialized admin system',
                timestamp: '2024-03-20T09:00:00Z'
            },
            {
                id: 'log_002',
                userId: 'user_001',
                userName: 'Super Admin',
                action: 'Post Management',
                description: 'Created post "Welcome to Our New Website"',
                timestamp: '2024-03-20T10:00:00Z'
            },
            {
                id: 'log_003',
                userId: 'user_002',
                userName: 'Admin User',
                action: 'User Management',
                description: 'Created user "Content Editor"',
                timestamp: '2024-03-20T11:30:00Z'
            },
            {
                id: 'log_004',
                userId: 'user_003',
                userName: 'Content Editor',
                action: 'Post Management',
                description: 'Published post "Community Service Day Success"',
                timestamp: '2024-03-20T12:15:00Z'
            },
            {
                id: 'log_005',
                userId: 'user_001',
                userName: 'Super Admin',
                action: 'Settings',
                description: 'Updated site configuration',
                timestamp: '2024-03-20T13:45:00Z'
            }
        ];

        localStorage.setItem('adminActivityLogs', JSON.stringify(activityLogs));
        console.log('Activity logs initialized');
    }

    // Get all posts
    getPosts() {
        try {
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            return posts;
        } catch (error) {
            console.error('Error getting posts:', error);
            return [];
        }
    }

    // Get post by ID
    getPostById(id) {
        const posts = this.getPosts();
        return posts.find(post => post.id === id);
    }

    // Get posts by status
    getPostsByStatus(status) {
        const posts = this.getPosts();
        return posts.filter(post => post.status === status);
    }

    // Get posts by category
    getPostsByCategory(category) {
        const posts = this.getPosts();
        return posts.filter(post => post.category === category);
    }

    // Get all users
    getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    // Get user by ID
    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    }

    // Get user by username
    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(user => user.username === username);
    }

    // Get users by role
    getUsersByRole(role) {
        const users = this.getUsers();
        return users.filter(user => user.role === role);
    }

    // Get users by status
    getUsersByStatus(status) {
        const users = this.getUsers();
        return users.filter(user => user.status === status);
    }

    // Get categories
    getCategories() {
        try {
            const categories = JSON.parse(localStorage.getItem('postsCategories')) || [];
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    // Get tags
    getTags() {
        try {
            const tags = JSON.parse(localStorage.getItem('postsTags')) || [];
            return tags;
        } catch (error) {
            console.error('Error getting tags:', error);
            return [];
        }
    }

    // Get activity logs
    getActivityLogs(limit = null) {
        try {
            const logs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
            
            // Sort by timestamp (newest first)
            const sortedLogs = logs.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            // Apply limit if specified
            if (limit && limit > 0) {
                return sortedLogs.slice(0, limit);
            }

            return sortedLogs;

        } catch (error) {
            console.error('Error getting activity logs:', error);
            return [];
        }
    }

    // Get dashboard statistics
    getDashboardStats() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const activityLogs = this.getActivityLogs();

        const stats = {
            posts: {
                total: posts.length,
                published: posts.filter(p => p.status === 'published').length,
                draft: posts.filter(p => p.status === 'draft').length,
                scheduled: posts.filter(p => p.status === 'scheduled').length
            },
            users: {
                total: users.length,
                active: users.filter(u => u.status === 'active').length,
                superAdmins: users.filter(u => u.role === 'superadmin').length,
                inactive: users.filter(u => u.status !== 'active').length
            },
            activity: {
                totalLogs: activityLogs.length,
                todayLogs: activityLogs.filter(log => 
                    new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length
            },
            views: {
                total: posts.reduce((sum, post) => sum + (post.views || 0), 0),
                average: posts.length > 0 ? 
                    Math.round(posts.reduce((sum, post) => sum + (post.views || 0), 0) / posts.length) : 0
            }
        };

        return stats;
    }

    // Search posts
    searchPosts(query, filters = {}) {
        const posts = this.getPosts();
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm && Object.keys(filters).length === 0) {
            return posts;
        }

        return posts.filter(post => {
            // Text search
            let matchesSearch = true;
            if (searchTerm) {
                matchesSearch = (
                    (post.title && post.title.toLowerCase().includes(searchTerm)) ||
                    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
                    (post.content && post.content.toLowerCase().includes(searchTerm)) ||
                    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                    (post.author && post.author.toLowerCase().includes(searchTerm))
                );
            }

            // Filter by status
            let matchesStatus = true;
            if (filters.status) {
                matchesStatus = post.status === filters.status;
            }

            // Filter by category
            let matchesCategory = true;
            if (filters.category) {
                matchesCategory = post.category === filters.category;
            }

            // Filter by author
            let matchesAuthor = true;
            if (filters.author) {
                matchesAuthor = post.author === filters.author;
            }

            // Filter by date range
            let matchesDateRange = true;
            if (filters.dateFrom || filters.dateTo) {
                const postDate = new Date(post.createdAt);
                if (filters.dateFrom) {
                    matchesDateRange = matchesDateRange && postDate >= new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    const dateTo = new Date(filters.dateTo);
                    dateTo.setHours(23, 59, 59, 999);
                    matchesDateRange = matchesDateRange && postDate <= dateTo;
                }
            }

            return matchesSearch && matchesStatus && matchesCategory && matchesAuthor && matchesDateRange;
        });
    }

    // Search users
    searchUsers(query, filters = {}) {
        const users = this.getUsers();
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm && Object.keys(filters).length === 0) {
            return users;
        }

        return users.filter(user => {
            // Text search
            let matchesSearch = true;
            if (searchTerm) {
                matchesSearch = (
                    (user.username && user.username.toLowerCase().includes(searchTerm)) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                    (user.phone && user.phone.includes(searchTerm))
                );
            }

            // Filter by role
            let matchesRole = true;
            if (filters.role) {
                matchesRole = user.role === filters.role;
            }

            // Filter by status
            let matchesStatus = true;
            if (filters.status) {
                matchesStatus = user.status === filters.status;
            }

            // Filter by department
            let matchesDepartment = true;
            if (filters.department) {
                matchesDepartment = user.department === filters.department;
            }

            return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
        });
    }

    // Add new post
    addPost(postData) {
        try {
            const posts = this.getPosts();
            
            // Generate unique ID
            const id = 'post_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            
            // Create post object
            const newPost = {
                id,
                ...postData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                likes: 0,
                comments: 0
            };

            // Add to posts array
            posts.unshift(newPost);

            // Save to localStorage
            localStorage.setItem('posts', JSON.stringify(posts));

            // Update category count
            this.updateCategoryCount(postData.category);

            // Add activity log
            this.addActivityLog(
                'Post Creation',
                `Created post "${postData.title}"`,
                postData.author || 'System'
            );

            return {
                success: true,
                post: newPost,
                message: 'Post created successfully'
            };

        } catch (error) {
            console.error('Error adding post:', error);
            return {
                success: false,
                message: 'Failed to create post'
            };
        }
    }

    // Update post
    updatePost(id, postData) {
        try {
            const posts = this.getPosts();
            const postIndex = posts.findIndex(post => post.id === id);

            if (postIndex === -1) {
                return {
                    success: false,
                    message: 'Post not found'
                };
            }

            // Update post
            const oldCategory = posts[postIndex].category;
            posts[postIndex] = {
                ...posts[postIndex],
                ...postData,
                updatedAt: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('posts', JSON.stringify(posts));

            // Update category counts if category changed
            if (oldCategory !== postData.category) {
                this.updateCategoryCount(oldCategory, -1);
                this.updateCategoryCount(postData.category, 1);
            }

            // Add activity log
            this.addActivityLog(
                'Post Update',
                `Updated post "${posts[postIndex].title}"`,
                postData.author || posts[postIndex].author
            );

            return {
                success: true,
                post: posts[postIndex],
                message: 'Post updated successfully'
            };

        } catch (error) {
            console.error('Error updating post:', error);
            return {
                success: false,
                message: 'Failed to update post'
            };
        }
    }

    // Delete post
    deletePost(id) {
        try {
            const posts = this.getPosts();
            const postIndex = posts.findIndex(post => post.id === id);

            if (postIndex === -1) {
                return {
                    success: false,
                    message: 'Post not found'
                };
            }

            const deletedPost = posts[postIndex];

            // Remove from array
            posts.splice(postIndex, 1);

            // Save to localStorage
            localStorage.setItem('posts', JSON.stringify(posts));

            // Update category count
            this.updateCategoryCount(deletedPost.category, -1);

            // Add activity log
            this.addActivityLog(
                'Post Deletion',
                `Deleted post "${deletedPost.title}"`,
                deletedPost.author || 'System'
            );

            return {
                success: true,
                message: 'Post deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting post:', error);
            return {
                success: false,
                message: 'Failed to delete post'
            };
        }
    }

    // Update category count
    updateCategoryCount(categoryName, increment = 1) {
        try {
            const categories = this.getCategories();
            const categoryIndex = categories.findIndex(cat => cat.name === categoryName);

            if (categoryIndex !== -1) {
                categories[categoryIndex].postCount = 
                    (categories[categoryIndex].postCount || 0) + increment;
                
                // Ensure count doesn't go below 0
                if (categories[categoryIndex].postCount < 0) {
                    categories[categoryIndex].postCount = 0;
                }

                localStorage.setItem('postsCategories', JSON.stringify(categories));
            }
        } catch (error) {
            console.error('Error updating category count:', error);
        }
    }

    // Add activity log
    addActivityLog(action, description, userName = 'System') {
        try {
            const logs = this.getActivityLogs();
            
            const newLog = {
                id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                userId: this.getCurrentUserId() || 'system',
                userName: userName,
                action: action,
                description: description,
                timestamp: new Date().toISOString()
            };

            logs.unshift(newLog);

            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(100);
            }

            localStorage.setItem('adminActivityLogs', JSON.stringify(logs));

            return newLog;

        } catch (error) {
            console.error('Error adding activity log:', error);
            return null;
        }
    }

    // Get current user ID
    getCurrentUserId() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return currentUser?.id || null;
        } catch (error) {
            return null;
        }
    }

    // Export data
    exportData(type = 'all') {
        try {
            let data;
            let filename;
            let mimeType = 'application/json';

            switch (type) {
                case 'posts':
                    data = {
                        posts: this.getPosts(),
                        categories: this.getCategories(),
                        tags: this.getTags()
                    };
                    filename = `posts-export-${new Date().toISOString().split('T')[0]}.json`;
                    break;

                case 'users':
                    data = {
                        users: this.getUsers(),
                        roles: JSON.parse(localStorage.getItem('adminRoles') || '[]'),
                        permissions: this.getPermissions()
                    };
                    filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
                    break;

                case 'all':
                default:
                    data = {
                        posts: this.getPosts(),
                        categories: this.getCategories(),
                        tags: this.getTags(),
                        users: this.getUsers(),
                        roles: JSON.parse(localStorage.getItem('adminRoles') || '[]'),
                        activityLogs: this.getActivityLogs(50),
                        metadata: {
                            exportedAt: new Date().toISOString(),
                            version: '1.0.0',
                            type: 'full-export'
                        }
                    };
                    filename = `full-export-${new Date().toISOString().split('T')[0]}.json`;
                    break;
            }

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: mimeType });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Add activity log
            this.addActivityLog('Export', `Exported ${type} data`);

            return {
                success: true,
                message: `Data exported successfully as ${filename}`
            };

        } catch (error) {
            console.error('Error exporting data:', error);
            return {
                success: false,
                message: 'Failed to export data'
            };
        }
    }

    // Import data
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid data format');
                    }

                    // Import posts data
                    if (data.posts && Array.isArray(data.posts)) {
                        localStorage.setItem('posts', JSON.stringify(data.posts));
                    }

                    if (data.categories && Array.isArray(data.categories)) {
                        localStorage.setItem('postsCategories', JSON.stringify(data.categories));
                    }

                    if (data.tags && Array.isArray(data.tags)) {
                        localStorage.setItem('postsTags', JSON.stringify(data.tags));
                    }

                    // Import users data
                    if (data.users && Array.isArray(data.users)) {
                        localStorage.setItem('adminUsers', JSON.stringify(data.users));
                    }

                    if (data.roles && Array.isArray(data.roles)) {
                        localStorage.setItem('adminRoles', JSON.stringify(data.roles));
                    }

                    // Add activity log
                    this.addActivityLog('Import', 'Imported data from file');

                    resolve({
                        success: true,
                        message: 'Data imported successfully'
                    });

                } catch (error) {
                    console.error('Error importing data:', error);
                    reject({
                        success: false,
                        message: error.message || 'Failed to import data'
                    });
                }
            };

            reader.onerror = () => {
                reject({
                    success: false,
                    message: 'Failed to read file'
                });
            };

            reader.readAsText(file);
        });
    }

    // Get permissions list
    getPermissions() {
        return [
            { id: 'perm_001', name: 'posts', displayName: 'Manage Posts', category: 'content' },
            { id: 'perm_002', name: 'pages', displayName: 'Manage Pages', category: 'content' },
            { id: 'perm_003', name: 'media', displayName: 'Manage Media', category: 'content' },
            { id: 'perm_004', name: 'comments', displayName: 'Manage Comments', category: 'content' },
            { id: 'perm_005', name: 'users', displayName: 'Manage Users', category: 'system' },
            { id: 'perm_006', name: 'settings', displayName: 'Manage Settings', category: 'system' },
            { id: 'perm_007', name: 'analytics', displayName: 'View Analytics', category: 'system' }
        ];
    }

    // Setup auto-refresh for data
    setupAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.refreshCache();
        }, this.cacheDuration);
    }

    // Refresh cache
    refreshCache() {
        console.log('Refreshing data cache...');
        // In a real application, this would fetch fresh data from the server
        // For now, we'll just update timestamps
        localStorage.setItem('lastCacheRefresh', new Date().toISOString());
    }

    // Backup all data
    backupAllData() {
        return this.exportData('all');
    }

    // Restore from backup
    restoreBackup(file) {
        return this.importData(file);
    }

    // Clear all data (reset to demo data)
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will reset everything to demo data.')) {
            localStorage.clear();
            this.checkLocalStorage();
            
            this.addActivityLog('System', 'Cleared all data and reset to demo data');
            
            return {
                success: true,
                message: 'All data cleared and reset to demo data'
            };
        }
        
        return {
            success: false,
            message: 'Operation cancelled'
        };
    }

    // Get system info
    getSystemInfo() {
        return {
            localStorageSize: this.getLocalStorageSize(),
            totalPosts: this.getPosts().length,
            totalUsers: this.getUsers().length,
            totalCategories: this.getCategories().length,
            totalActivityLogs: this.getActivityLogs().length,
            lastCacheRefresh: localStorage.getItem('lastCacheRefresh') || 'Never',
            browserInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            }
        };
    }

    // Get localStorage size
    getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16 characters use 2 bytes
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }
}

// Initialize data loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dataLoader = new DataLoader();
    
    // Make data loader available globally
    window.dataLoader = dataLoader;
    
    console.log('Data Loader initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
