// admin/js/admin-auth.js - Authentication & Session Management

class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.inactivityTimer = null;
        this.init();
    }

    // Initialize authentication system
    init() {
        this.loadCurrentUser();
        this.setupSessionTimeout();
        this.setupInactivityListener();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateUIWithUser();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.logout();
        }
    }

    // Update UI with current user info
    updateUIWithUser() {
        const avatarElements = document.querySelectorAll('.user-avatar, #currentUserAvatar');
        const userNameElements = document.querySelectorAll('.user-name, #currentUserName');
        
        if (this.currentUser && this.currentUser.name) {
            // Update avatars
            avatarElements.forEach(avatar => {
                avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
                if (this.currentUser.avatarColor) {
                    avatar.className = `user-avatar ${this.currentUser.avatarColor}`;
                }
            });
            
            // Update user names
            userNameElements.forEach(element => {
                if (element.tagName === 'INPUT') {
                    element.value = this.currentUser.name;
                } else {
                    element.textContent = this.currentUser.name;
                }
            });
        }
    }

    // Login function
    async login(username, password) {
        try {
            // Get admin users from localStorage
            const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            
            // Find user by username
            const user = adminUsers.find(u => 
                u.username === username && 
                u.password === password // In production, compare hashed passwords
            );
            
            if (!user) {
                throw new Error('Invalid username or password');
            }
            
            if (user.status !== 'active') {
                throw new Error('Account is inactive. Please contact administrator.');
            }
            
            // Set current user
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                permissions: user.permissions || [],
                avatarColor: user.avatarColor
            };
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            
            // Update last login time
            this.updateLastLogin(user.id);
            
            // Update UI
            this.updateUIWithUser();
            
            // Reset inactivity timer
            this.resetInactivityTimer();
            
            // Add login activity log
            this.addActivityLog('Login', 'Logged into admin panel');
            
            return {
                success: true,
                user: this.currentUser
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Update last login time
    updateLastLogin(userId) {
        try {
            const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const userIndex = adminUsers.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                adminUsers[userIndex].lastLogin = new Date().toISOString();
                localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
            }
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Logout function
    logout(redirect = true) {
        // Add logout activity log
        if (this.currentUser) {
            this.addActivityLog('Logout', 'Logged out from admin panel');
        }
        
        // Clear user data
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        
        // Clear inactivity timer
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Redirect to login page
        if (redirect) {
            const loginPage = window.location.pathname.includes('/admin/') ? 'index.html' : '../index.html';
            window.location.href = loginPage;
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const loginTime = localStorage.getItem('loginTime');
        
        if (!isLoggedIn || !loginTime) {
            return false;
        }
        
        // Check if session has expired
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        if (timeSinceLogin > this.sessionTimeout) {
            this.logout(false);
            return false;
        }
        
        // Update login time to extend session
        localStorage.setItem('loginTime', Date.now().toString());
        return true;
    }

    // Check if user has permission
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Super admin has all permissions
        if (this.currentUser.role === 'superadmin') {
            return true;
        }
        
        // Check specific permissions
        return this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }

    // Check if user has role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Setup session timeout
    setupSessionTimeout() {
        window.addEventListener('load', () => {
            if (!this.isLoggedIn() && !window.location.pathname.includes('index.html')) {
                this.redirectToLogin();
            }
        });
    }

    // Redirect to login page
    redirectToLogin() {
        const currentPath = window.location.pathname;
        const isAdminPath = currentPath.includes('/admin/');
        
        if (isAdminPath && !currentPath.includes('index.html')) {
            const loginPage = currentPath.includes('/admin/') ? 'index.html' : '../index.html';
            window.location.href = loginPage;
        }
    }

    // Setup inactivity listener
    setupInactivityListener() {
        const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetInactivityTimer();
            });
        });
        
        this.resetInactivityTimer();
    }

    // Reset inactivity timer
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => {
            if (this.isLoggedIn()) {
                this.logout();
            }
        }, this.sessionTimeout);
    }

    // Add activity log
    addActivityLog(action, description) {
        try {
            const activityLogs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
            
            const newLog = {
                id: this.generateId(),
                userId: this.currentUser?.id || 'system',
                userName: this.currentUser?.name || 'System',
                action,
                description,
                timestamp: new Date().toISOString()
            };
            
            activityLogs.unshift(newLog);
            
            // Keep only last 100 logs
            if (activityLogs.length > 100) {
                activityLogs.splice(100);
            }
            
            localStorage.setItem('adminActivityLogs', JSON.stringify(activityLogs));
            
        } catch (error) {
            console.error('Error adding activity log:', error);
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get user permissions
    getUserPermissions() {
        return this.currentUser?.permissions || [];
    }

    // Get user role
    getUserRole() {
        return this.currentUser?.role || null;
    }

    // Update user profile
    updateProfile(userData) {
        try {
            const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const userIndex = adminUsers.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            // Update user data
            adminUsers[userIndex] = {
                ...adminUsers[userIndex],
                ...userData,
                updatedAt: new Date().toISOString()
            };
            
            // Update current user
            this.currentUser = {
                ...this.currentUser,
                ...userData
            };
            
            // Save to localStorage
            localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Update UI
            this.updateUIWithUser();
            
            // Add activity log
            this.addActivityLog('Profile Update', 'Updated profile information');
            
            return {
                success: true,
                message: 'Profile updated successfully'
            };
            
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Change password
    changePassword(currentPassword, newPassword) {
        try {
            const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const userIndex = adminUsers.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            // Verify current password
            if (adminUsers[userIndex].password !== currentPassword) {
                throw new Error('Current password is incorrect');
            }
            
            // Update password
            adminUsers[userIndex].password = newPassword;
            adminUsers[userIndex].updatedAt = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
            
            // Add activity log
            this.addActivityLog('Security', 'Changed password');
            
            return {
                success: true,
                message: 'Password changed successfully'
            };
            
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Setup logout button
    setupLogoutButton(buttonId = 'logoutBtn') {
        const logoutBtn = document.getElementById(buttonId);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    // Protect route (use in page scripts)
    protectRoute() {
        if (!this.isLoggedIn()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    // Get user stats (for dashboard)
    getUserStats() {
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        
        return {
            total: adminUsers.length,
            active: adminUsers.filter(u => u.status === 'active').length,
            superAdmins: adminUsers.filter(u => u.role === 'superadmin').length,
            inactive: adminUsers.filter(u => u.status !== 'active').length
        };
    }

    // Get recent activity (for dashboard)
    getRecentActivity(limit = 5) {
        const activityLogs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
        return activityLogs.slice(0, limit);
    }

    // Format time ago
    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Create global instance
const adminAuth = new AdminAuth();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminAuth, adminAuth };
}
