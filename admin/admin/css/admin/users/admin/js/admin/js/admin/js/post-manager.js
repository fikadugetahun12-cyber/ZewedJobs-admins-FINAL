// admin/js/post-manager.js - Posts Management System

class PostManager {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilter = {};
        this.selectedPosts = [];
        this.init();
    }

    // Initialize post manager
    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.setupRichTextEditor();
    }

    // Load posts from localStorage
    loadPosts() {
        try {
            this.posts = JSON.parse(localStorage.getItem('posts')) || [];
            return this.posts;
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts');
            return [];
        }
    }

    // Save posts to localStorage
    savePosts() {
        try {
            localStorage.setItem('posts', JSON.stringify(this.posts));
            return true;
        } catch (error) {
            console.error('Error saving posts:', error);
            this.showError('Failed to save posts');
            return false;
        }
    }

    // Get all posts
    getAllPosts() {
        return this.posts;
    }

    // Get post by ID
    getPostById(id) {
        return this.posts.find(post => post.id === id);
    }

    // Create new post
    createPost(postData) {
        try {
            // Generate unique ID
            const id = this.generateId();
            
            // Create post object
            const post = {
                id,
                ...postData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add to posts array
            this.posts.unshift(post);

            // Save to localStorage
            if (this.savePosts()) {
                // Add activity log
                adminAuth.addActivityLog('Post Creation', `Created post "${post.title}"`);
                
                return {
                    success: true,
                    post,
                    message: 'Post created successfully'
                };
            } else {
                throw new Error('Failed to save post');
            }

        } catch (error) {
            console.error('Error creating post:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Update existing post
    updatePost(id, postData) {
        try {
            const postIndex = this.posts.findIndex(post => post.id === id);
            
            if (postIndex === -1) {
                throw new Error('Post not found');
            }

            // Update post
            this.posts[postIndex] = {
                ...this.posts[postIndex],
                ...postData,
                updatedAt: new Date().toISOString()
            };

            // Save to localStorage
            if (this.savePosts()) {
                // Add activity log
                adminAuth.addActivityLog('Post Update', `Updated post "${this.posts[postIndex].title}"`);
                
                return {
                    success: true,
                    post: this.posts[postIndex],
                    message: 'Post updated successfully'
                };
            } else {
                throw new Error('Failed to save post');
            }

        } catch (error) {
            console.error('Error updating post:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Delete post
    deletePost(id) {
        try {
            const postIndex = this.posts.findIndex(post => post.id === id);
            
            if (postIndex === -1) {
                throw new Error('Post not found');
            }

            const postTitle = this.posts[postIndex].title;

            // Remove post from array
            this.posts.splice(postIndex, 1);

            // Save to localStorage
            if (this.savePosts()) {
                // Add activity log
                adminAuth.addActivityLog('Post Deletion', `Deleted post "${postTitle}"`);
                
                return {
                    success: true,
                    message: 'Post deleted successfully'
                };
            } else {
                throw new Error('Failed to save posts');
            }

        } catch (error) {
            console.error('Error deleting post:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Delete multiple posts
    deleteMultiplePosts(postIds) {
        try {
            const deletedCount = postIds.reduce((count, id) => {
                const result = this.deletePost(id);
                return result.success ? count + 1 : count;
            }, 0);

            return {
                success: true,
                deletedCount,
                message: `${deletedCount} post(s) deleted successfully`
            };

        } catch (error) {
            console.error('Error deleting multiple posts:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get post statistics
    getPostStats() {
        const total = this.posts.length;
        const published = this.posts.filter(p => p.status === 'published').length;
        const draft = this.posts.filter(p => p.status === 'draft').length;
        const scheduled = this.posts.filter(p => p.status === 'scheduled').length;

        return {
            total,
            published,
            draft,
            scheduled,
            categories: this.getCategoryStats()
        };
    }

    // Get category statistics
    getCategoryStats() {
        const categories = {};
        
        this.posts.forEach(post => {
            const category = post.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });

        return categories;
    }

    // Search posts
    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt?.toLowerCase().includes(searchTerm) ||
            post.content?.toLowerCase().includes(searchTerm) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    // Filter posts
    filterPosts(filters) {
        let filteredPosts = [...this.posts];

        if (filters.status) {
            filteredPosts = filteredPosts.filter(post => post.status === filters.status);
        }

        if (filters.category) {
            filteredPosts = filteredPosts.filter(post => post.category === filters.category);
        }

        if (filters.author) {
            filteredPosts = filteredPosts.filter(post => post.author === filters.author);
        }

        if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom);
            filteredPosts = filteredPosts.filter(post => new Date(post.createdAt) >= dateFrom);
        }

        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            filteredPosts = filteredPosts.filter(post => new Date(post.createdAt) <= dateTo);
        }

        return filteredPosts;
    }

    // Get paginated posts
    getPaginatedPosts(posts = this.posts, page = 1, perPage = 10) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        return {
            posts: posts.slice(startIndex, endIndex),
            currentPage: page,
            totalPages: Math.ceil(posts.length / perPage),
            totalPosts: posts.length
        };
    }

    // Setup rich text editor
    setupRichTextEditor() {
        const editor = document.getElementById('postContent');
        if (!editor) return;

        // Setup toolbar buttons
        const toolbar = document.querySelector('.editor-toolbar');
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const button = e.target.closest('.editor-btn');
                if (button) {
                    const command = button.dataset.command;
                    const value = button.dataset.value;
                    
                    this.executeEditorCommand(command, value);
                }
            });
        }

        // Auto-save content
        editor.addEventListener('input', () => {
            this.autoSaveContent(editor.innerHTML);
        });

        // Initialize content if editing existing post
        this.loadEditorContent();
    }

    // Execute editor command
    executeEditorCommand(command, value) {
        const editor = document.getElementById('postContent');
        if (!editor) return;

        editor.focus();
        
        try {
            if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else if (command === 'insertImage') {
                const url = prompt('Enter image URL:');
                if (url) {
                    document.execCommand('insertImage', false, url);
                }
            } else if (value) {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }
        } catch (error) {
            console.error('Error executing editor command:', error);
        }
    }

    // Auto-save content
    autoSaveContent(content) {
        // Save to localStorage temporarily
        localStorage.setItem('postDraft', content);
    }

    // Load editor content
    loadEditorContent() {
        const editor = document.getElementById('postContent');
        const hiddenInput = document.getElementById('postContentHidden');
        
        if (!editor || !hiddenInput) return;

        // Check if editing existing post
        const postId = this.getPostIdFromUrl();
        if (postId) {
            const post = this.getPostById(postId);
            if (post && post.content) {
                editor.innerHTML = post.content;
                hiddenInput.value = post.content;
            }
        } else {
            // Load from draft
            const draft = localStorage.getItem('postDraft');
            if (draft) {
                editor.innerHTML = draft;
                hiddenInput.value = draft;
            }
        }
    }

    // Get post ID from URL
    getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const postForm = document.getElementById('postForm');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePostSubmit();
            });
        }

        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        const fileInput = document.getElementById('postFeaturedImage');
        
        if (imageUpload && fileInput) {
            imageUpload.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Bulk actions
        const bulkActionBtn = document.getElementById('applyBulkAction');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', () => this.handleBulkAction());
        }

        // Post status change
        const statusSelect = document.getElementById('postStatus');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.toggleScheduleDate(e.target.value === 'scheduled');
            });
        }

        // Auto-generate slug
        const titleInput = document.getElementById('postTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.generateSlug(e.target.value);
            });
        }

        // Delete confirmation
        const deleteButtons = document.querySelectorAll('.delete-post-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.id || e.target.closest('[data-id]').dataset.id;
                if (postId) {
                    this.confirmDeletePost(postId);
                }
            });
        });

        // Auto-save interval
        setInterval(() => {
            this.saveDraft();
        }, 30000); // Every 30 seconds
    }

    // Handle post form submission
    handlePostSubmit() {
        try {
            // Get form data
            const formData = new FormData(document.getElementById('postForm'));
            const postData = {};
            
            for (const [key, value] of formData.entries()) {
                postData[key] = value;
            }

            // Get content from editor
            const editor = document.getElementById('postContent');
            if (editor) {
                postData.content = editor.innerHTML;
            }

            // Get tags
            const tagsInput = document.getElementById('postTags');
            if (tagsInput) {
                postData.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            }

            // Get checkboxes
            postData.allowComments = document.getElementById('postComments')?.checked || false;
            postData.featured = document.getElementById('postFeatured')?.checked || false;
            postData.sticky = document.getElementById('postSticky')?.checked || false;

            // Validate required fields
            if (!postData.title || !postData.content) {
                throw new Error('Title and content are required');
            }

            // Check if editing existing post
            const postId = this.getPostIdFromUrl();
            let result;

            if (postId) {
                // Update existing post
                result = this.updatePost(postId, postData);
            } else {
                // Create new post
                result = this.createPost(postData);
            }

            if (result.success) {
                // Clear draft
                localStorage.removeItem('postDraft');
                
                // Show success message
                this.showSuccess(result.message);
                
                // Redirect to posts list after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'list.html';
                }, 1500);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error submitting post:', error);
            this.showError(error.message);
        }
    }

    // Handle image upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Update preview
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImage');
            
            if (previewImg) {
                previewImg.src = imageUrl;
            }
            
            if (preview) {
                preview.style.display = 'block';
            }
            
            // Hide upload area
            const uploadArea = document.getElementById('imageUpload');
            if (uploadArea) {
                uploadArea.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    }

    // Handle bulk actions
    handleBulkAction() {
        const select = document.getElementById('bulkActionSelect');
        if (!select || !select.value) {
            this.showError('Please select a bulk action');
            return;
        }

        if (this.selectedPosts.length === 0) {
            this.showError('Please select at least one post');
            return;
        }

        const action = select.value;
        
        switch (action) {
            case 'publish':
                this.bulkUpdateStatus('published');
                break;
            case 'draft':
                this.bulkUpdateStatus('draft');
                break;
            case 'delete':
                this.bulkDeletePosts();
                break;
            default:
                this.showError('Invalid action');
        }
    }

    // Bulk update post status
    bulkUpdateStatus(status) {
        try {
            const updatedCount = this.selectedPosts.reduce((count, postId) => {
                const result = this.updatePost(postId, { status });
                return result.success ? count + 1 : count;
            }, 0);

            if (updatedCount > 0) {
                this.showSuccess(`${updatedCount} post(s) updated successfully`);
                this.selectedPosts = [];
                this.refreshPostsList();
            }

        } catch (error) {
            console.error('Error bulk updating posts:', error);
            this.showError('Failed to update posts');
        }
    }

    // Bulk delete posts
    bulkDeletePosts() {
        if (confirm(`Are you sure you want to delete ${this.selectedPosts.length} post(s)? This action cannot be undone.`)) {
            const result = this.deleteMultiplePosts(this.selectedPosts);
            
            if (result.success) {
                this.showSuccess(result.message);
                this.selectedPosts = [];
                this.refreshPostsList();
            } else {
                this.showError(result.message);
            }
        }
    }

    // Toggle schedule date field
    toggleScheduleDate(show) {
        const scheduleGroup = document.getElementById('scheduleDateGroup');
        if (scheduleGroup) {
            scheduleGroup.style.display = show ? 'block' : 'none';
            
            if (show) {
                // Set default to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0);
                
                const dateInput = document.getElementById('postScheduleDate');
                if (dateInput) {
                    dateInput.value = tomorrow.toISOString().slice(0, 16);
                }
            }
        }
    }

    // Generate URL slug from title
    generateSlug(title) {
        const slugInput = document.getElementById('postSlug');
        if (!slugInput) return;

        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();

        slugInput.value = slug;
    }

    // Confirm post deletion
    confirmDeletePost(postId) {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            const result = this.deletePost(postId);
            
            if (result.success) {
                this.showSuccess(result.message);
                
                // If on edit page, redirect to list
                if (window.location.pathname.includes('edit.html')) {
                    setTimeout(() => {
                        window.location.href = 'list.html';
                    }, 1500);
                } else {
                    // If on list page, refresh
                    this.refreshPostsList();
                }
            } else {
                this.showError(result.message);
            }
        }
    }

    // Save draft
    saveDraft() {
        const editor = document.getElementById('postContent');
        const title = document.getElementById('postTitle')?.value;
        
        if (editor && title) {
            const draft = {
                title,
                content: editor.innerHTML,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('postDraft', JSON.stringify(draft));
        }
    }

    // Refresh posts list
    refreshPostsList() {
        // Dispatch custom event for list page to listen to
        const event = new CustomEvent('postsUpdated');
        document.dispatchEvent(event);
    }

    // Export posts
    exportPosts(format = 'json') {
        try {
            let data, mimeType, extension;

            switch (format) {
                case 'json':
                    data = JSON.stringify(this.posts, null, 2);
                    mimeType = 'application/json';
                    extension = 'json';
                    break;
                    
                case 'csv':
                    data = this.convertPostsToCSV();
                    mimeType = 'text/csv';
                    extension = 'csv';
                    break;
                    
                default:
                    throw new Error('Unsupported format');
            }

            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `posts-export-${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Add activity log
            adminAuth.addActivityLog('Export', `Exported posts as ${format.toUpperCase()}`);

            this.showSuccess('Posts exported successfully!');

        } catch (error) {
            console.error('Error exporting posts:', error);
            this.showError('Failed to export posts');
        }
    }

    // Convert posts to CSV
    convertPostsToCSV() {
        const headers = ['Title', 'Slug', 'Category', 'Status', 'Author', 'Created At', 'Updated At'];
        const rows = this.posts.map(post => [
            post.title,
            post.slug || '',
            post.category || '',
            post.status || '',
            post.author || '',
            post.createdAt,
            post.updatedAt
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Import posts
    importPosts(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    let importedPosts;
                    
                    if (file.type === 'application/json') {
                        importedPosts = JSON.parse(content);
                    } else if (file.type === 'text/csv') {
                        importedPosts = this.parseCSV(content);
                    } else {
                        throw new Error('Unsupported file format');
                    }

                    // Validate imported posts
                    if (!Array.isArray(importedPosts)) {
                        throw new Error('Invalid data format');
                    }

                    // Merge with existing posts
                    const existingPosts = this.posts;
                    const mergedPosts = [...existingPosts, ...importedPosts];

                    // Remove duplicates based on ID
                    const uniquePosts = mergedPosts.filter((post, index, self) =>
                        index === self.findIndex(p => p.id === post.id)
                    );

                    // Update posts
                    this.posts = uniquePosts;
                    
                    // Save to localStorage
                    if (this.savePosts()) {
                        // Add activity log
                        adminAuth.addActivityLog('Import', `Imported ${importedPosts.length} posts`);
                        
                        resolve({
                            success: true,
                            imported: importedPosts.length,
                            total: uniquePosts.length,
                            message: 'Posts imported successfully'
                        });
                    } else {
                        throw new Error('Failed to save imported posts');
                    }

                } catch (error) {
                    reject({
                        success: false,
                        message: error.message
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

    // Parse CSV content
    parseCSV(content) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const post = {};
            
            headers.forEach((header, index) => {
                post[header.toLowerCase().replace(' ', '_')] = values[index]?.trim() || '';
            });
            
            // Add missing required fields
            post.id = post.id || this.generateId();
            post.createdAt = post.created_at || new Date().toISOString();
            post.updatedAt = post.updated_at || new Date().toISOString();
            
            return post;
        });
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
}

// Initialize post manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const postManager = new PostManager();
    
    // Make post manager available globally
    window.postManager = postManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostManager;
}
