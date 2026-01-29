// admin/js/admin-dashboard.js - Dashboard Functionality

class AdminDashboard {
    constructor() {
        this.stats = {};
        this.recentActivity = [];
        this.init();
    }

    // Initialize dashboard
    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.setupCharts();
        this.setupQuickActions();
    }

    // Load dashboard data
    loadDashboardData() {
        this.loadStats();
        this.loadRecentActivity();
        this.loadSystemStatus();
        this.loadNotifications();
    }

    // Load statistics
    loadStats() {
        try {
            // Load posts stats
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const publishedPosts = posts.filter(p => p.status === 'published').length;
            const draftPosts = posts.filter(p => p.status === 'draft').length;
            const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

            // Load users stats
            const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const activeUsers = adminUsers.filter(u => u.status === 'active').length;

            // Load visitor stats (mock data for now)
            const visitorStats = this.getMockVisitorStats();

            // Update stats object
            this.stats = {
                totalVisitors: visitorStats.total,
                newVisitors: visitorStats.new,
                postsPublished: publishedPosts,
                pendingReviews: draftPosts,
                scheduledPosts: scheduledPosts,
                totalPosts: posts.length,
                activeUsers: activeUsers,
                totalUsers: adminUsers.length,
                todayVisitors: visitorStats.today
            };

            // Update UI
            this.updateStatsUI();

        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Failed to load statistics');
        }
    }

    // Get mock visitor stats (in real app, this would come from analytics API)
    getMockVisitorStats() {
        return {
            total: 1254,
            new: 89,
            today: 42,
            thisWeek: 256,
            thisMonth: 854
        };
    }

    // Update stats UI
    updateStatsUI() {
        // Update each stat card
        for (const [key, value] of Object.entries(this.stats)) {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = this.formatNumber(value);
                
                // Add animation
                this.animateValue(element, 0, value, 1000);
            }
        }
    }

    // Animate number counting
    animateValue(element, start, end, duration) {
        if (start === end) return;
        
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = this.formatNumber(current);
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Load recent activity
    loadRecentActivity() {
        try {
            const activityLogs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
            this.recentActivity = activityLogs.slice(0, 10); // Get last 10 activities
            
            // Update UI
            this.updateActivityUI();

        } catch (error) {
            console.error('Error loading activity:', error);
        }
    }

    // Update activity UI
    updateActivityUI() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        // Clear current list
        activityList.innerHTML = '';

        // Add each activity item
        this.recentActivity.forEach(activity => {
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.userName}</strong> ${activity.description}
                    </div>
                    <div class="activity-meta">
                        ${activity.action}
                    </div>
                </div>
                <div class="activity-time">
                    ${timeAgo}
                </div>
            `;
            activityList.appendChild(activityItem);
        });

        // Show empty state if no activities
        if (this.recentActivity.length === 0) {
            activityList.innerHTML = `
                <li class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </li>
            `;
        }
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
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Load system status
    loadSystemStatus() {
        // Mock system status (in real app, this would check server status, etc.)
        const systemStatus = {
            website: { status: 'online', uptime: '99.9%' },
            database: { status: 'online', response: '45ms' },
            server: { status: 'online', load: '32%' },
            api: { status: 'online', latency: '120ms' }
        };

        // Update UI if status elements exist
        for (const [system, data] of Object.entries(systemStatus)) {
            const statusElement = document.getElementById(`${system}Status`);
            if (statusElement) {
                statusElement.textContent = data.status;
                statusElement.className = `status-badge ${data.status}`;
            }
        }
    }

    // Load notifications
    loadNotifications() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            const unreadCount = notifications.filter(n => !n.read).length;
            
            // Update notification badge
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }

            // Update notifications dropdown
            this.updateNotificationsDropdown(notifications);

        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Update notifications dropdown
    updateNotificationsDropdown(notifications) {
        const dropdown = document.getElementById('notificationsDropdown');
        if (!dropdown) return;

        // Get unread notifications (max 5)
        const unreadNotifications = notifications
            .filter(n => !n.read)
            .slice(0, 5);

        if (unreadNotifications.length === 0) {
            dropdown.innerHTML = `
                <div class="dropdown-item">
                    <div class="notification-item">
                        <i class="fas fa-bell-slash"></i>
                        <div class="notification-content">
                            <p>No new notifications</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        dropdown.innerHTML = unreadNotifications.map(notification => `
            <div class="dropdown-item notification-item" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-title">${notification.title}</p>
                    <small class="notification-time">${this.formatTimeAgo(notification.timestamp)}</small>
                </div>
            </div>
        `).join('');
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            user: 'fa-user',
            post: 'fa-newspaper',
            comment: 'fa-comment'
        };
        return icons[type] || 'fa-bell';
    }

    // Setup charts (using simple CSS charts for now)
    setupCharts() {
        this.setupVisitorChart();
        this.setupPostChart();
    }

    // Setup visitor chart
    setupVisitorChart() {
        const chartElement = document.getElementById('visitorChart');
        if (!chartElement) return;

        // Mock data for visitors
        const visitorData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [65, 59, 80, 81, 56, 55, 40]
        };

        // Create simple bar chart
        chartElement.innerHTML = `
            <div class="chart-container">
                <div class="chart-bars">
                    ${visitorData.data.map((value, index) => `
                        <div class="chart-bar-container">
                            <div class="chart-bar" style="height: ${value}%" 
                                 title="${visitorData.labels[index]}: ${value} visitors">
                            </div>
                            <span class="chart-label">${visitorData.labels[index]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add CSS for chart
        const style = document.createElement('style');
        style.textContent = `
            .chart-container {
                height: 200px;
                display: flex;
                align-items: flex-end;
                padding: 20px 0;
            }
            .chart-bars {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                width: 100%;
                height: 100%;
            }
            .chart-bar-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
            }
            .chart-bar {
                width: 30px;
                background: linear-gradient(to top, #667eea, #764ba2);
                border-radius: 3px 3px 0 0;
                transition: height 0.5s ease;
            }
            .chart-label {
                margin-top: 5px;
                font-size: 12px;
                color: #718096;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup post chart
    setupPostChart() {
        const chartElement = document.getElementById('postChart');
        if (!chartElement) return;

        // Get posts data
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const categories = {};
        
        posts.forEach(post => {
            if (post.category) {
                categories[post.category] = (categories[post.category] || 0) + 1;
            }
        });

        // Create simple pie chart
        if (Object.keys(categories).length > 0) {
            chartElement.innerHTML = `
                <div class="pie-chart">
                    ${Object.entries(categories).map(([category, count], index) => `
                        <div class="pie-segment" 
                             style="--color: ${this.getCategoryColor(category)};
                                    --percentage: ${(count / posts.length) * 100}%;
                                    --rotation: ${this.calculateRotation(Object.values(categories), index)}%;"
                             title="${category}: ${count} posts">
                            <span class="pie-label">${category}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            // Add CSS for pie chart
            const style = document.createElement('style');
            style.textContent = `
                .pie-chart {
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                }
                .pie-segment {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%);
                    background: var(--color);
                    transform: rotate(calc(var(--rotation) * 1deg));
                }
                .pie-label {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%) rotate(calc(var(--rotation) * -1deg));
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Get category color
    getCategoryColor(category) {
        const colors = {
            news: '#667eea',
            events: '#48bb78',
            announcements: '#ed8936',
            updates: '#9f7aea',
            default: '#a0aec0'
        };
        return colors[category] || colors.default;
    }

    // Calculate rotation for pie chart segments
    calculateRotation(values, index) {
        const total = values.reduce((sum, value) => sum + value, 0);
        const previousValues = values.slice(0, index);
        const previousTotal = previousValues.reduce((sum, value) => sum + value, 0);
        return (previousTotal / total) * 360;
    }

    // Setup quick actions
    setupQuickActions() {
        const actions = {
            addNewPost: () => window.location.href = 'posts/create.html',
            manageUsers: () => window.location.href = 'users/admins.html',
            viewAnalytics: () => this.showAnalytics(),
            siteSettings: () => this.showSettings(),
            backupSite: () => this.backupSite(),
            clearCache: () => this.clearCache()
        };

        // Add click handlers to action buttons
        Object.keys(actions).forEach(actionId => {
            const button = document.getElementById(actionId);
            if (button) {
                button.addEventListener('click', actions[actionId]);
            }
        });
    }

    // Show analytics modal
    showAnalytics() {
        alert('Analytics dashboard would open here. In a real application, this would show detailed analytics.');
    }

    // Show settings modal
    showSettings() {
        alert('Site settings would open here. In a real application, this would show site configuration options.');
    }

    // Backup site data
    backupSite() {
        try {
            // Collect all data from localStorage
            const backupData = {
                posts: JSON.parse(localStorage.getItem('posts')) || [],
                adminUsers: JSON.parse(localStorage.getItem('adminUsers')) || [],
                activityLogs: JSON.parse(localStorage.getItem('adminActivityLogs')) || [],
                backupDate: new Date().toISOString()
            };

            // Create download link
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `site-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Add activity log
            adminAuth.addActivityLog('Backup', 'Created site backup');

            // Show success message
            this.showSuccess('Backup created successfully!');

        } catch (error) {
            console.error('Error creating backup:', error);
            this.showError('Failed to create backup');
        }
    }

    // Clear cache
    clearCache() {
        if (confirm('Are you sure you want to clear cache? This will not delete your data.')) {
            // Clear temporary localStorage items (keep user data)
            const itemsToKeep = ['currentUser', 'isLoggedIn', 'loginTime', 'adminUsers', 'posts', 'adminActivityLogs'];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!itemsToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            }

            // Add activity log
            adminAuth.addActivityLog('System', 'Cleared cache');

            // Show success message
            this.showSuccess('Cache cleared successfully!');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
                this.showSuccess('Dashboard refreshed!');
            });
        }

        // Export data button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDashboardData());
        }

        // Mark all notifications as read
        const markReadBtn = document.getElementById('markAllRead');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => this.markAllNotificationsAsRead());
        }

        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadStats();
            this.loadRecentActivity();
        }, 5 * 60 * 1000);
    }

    // Export dashboard data as CSV
    exportDashboardData() {
        try {
            const csvData = [
                ['Metric', 'Value'],
                ['Total Visitors', this.stats.totalVisitors],
                ['New Visitors', this.stats.newVisitors],
                ['Posts Published', this.stats.postsPublished],
                ['Pending Reviews', this.stats.pendingReviews],
                ['Active Users', this.stats.activeUsers],
                ['Total Users', this.stats.totalUsers],
                ['Date', new Date().toLocaleDateString()]
            ];

            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-stats-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Add activity log
            adminAuth.addActivityLog('Export', 'Exported dashboard statistics');

            this.showSuccess('Data exported successfully!');

        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data');
        }
    }

    // Mark all notifications as read
    markAllNotificationsAsRead() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            notifications.forEach(notification => {
                notification.read = true;
            });
            
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Update UI
            this.loadNotifications();
            
            this.showSuccess('All notifications marked as read!');

        } catch (error) {
            console.error('Error marking notifications as read:', error);
            this.showError('Failed to mark notifications as read');
        }
    }

    // Show success message
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Show message
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `alert alert-${type} alert-dismissible animate-slide-down`;
        messageEl.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">&times;</button>
        `;

        // Add to page
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);

        // Add close button functionality
        const closeBtn = messageEl.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                messageEl.remove();
            });
        }
    }

    // Get dashboard summary
    getSummary() {
        return {
            stats: this.stats,
            recentActivity: this.recentActivity.slice(0, 5),
            lastUpdated: new Date().toISOString()
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AdminDashboard();
    
    // Make dashboard available globally
    window.adminDashboard = dashboard;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
