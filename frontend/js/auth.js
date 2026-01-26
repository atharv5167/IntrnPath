// ===========================================
// IntrnPath Auth Manager
// Handles authentication state and UI updates
// ===========================================

const AuthManager = (() => {
    // Check if user is logged in on page load
    const init = () => {
        const token = localStorage.getItem('internpath_token');
        const userData = localStorage.getItem('internpath_user');

        // Update UI based on auth state
        updateAuthUI(!!token);

        // Pages that require full authentication (token required)
        const protectedPages = ['/roadmap-detail'];
        // Pages that work with partial auth (user data from registration, even without email verification)
        const partialAuthPages = ['/onboarding', '/roadmap-preview', '/dashboard'];
        const currentPath = window.location.pathname;

        // Full auth check for protected pages (requires token)
        if (protectedPages.some(p => currentPath.includes(p))) {
            if (!token) {
                // Redirect to login page
                window.location.href = 'login.html';
                return;
            }
        }

        // Partial auth check for onboarding flow (allows users who just registered)
        // These pages work if user has started registration OR has a token
        if (partialAuthPages.some(p => currentPath.includes(p))) {
            if (!token && !userData) {
                // No user data at all - redirect to register
                window.location.href = 'register.html';
                return;
            }
        }

        // Load user data if logged in
        if (token) {
            loadUserData();
        }
    };


    // Update UI elements based on auth state
    const updateAuthUI = (isLoggedIn) => {
        const authButtons = document.querySelectorAll('.auth-buttons');
        const userButtons = document.querySelectorAll('.user-buttons');
        const logoutButtons = document.querySelectorAll('[data-action="logout"]');

        authButtons.forEach(el => el.style.display = isLoggedIn ? 'none' : 'flex');
        userButtons.forEach(el => el.style.display = isLoggedIn ? 'flex' : 'none');

        // Add logout handlers
        logoutButtons.forEach(btn => {
            btn.onclick = () => API.auth.logout();
        });
    };

    // Load user data from API
    const loadUserData = async () => {
        try {
            const response = await API.auth.getCurrentUser();
            if (response.success && response.data.user) {
                localStorage.setItem('internpath_user', JSON.stringify(response.data.user));
                updateUserDisplay(response.data.user);

                // Sync all user data (progress, skills, roadmap) from server
                if (window.DataSync) {
                    await window.DataSync.loadAllUserData();
                    console.log('[Auth] Full user data sync completed');
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            // If unauthorized, clear tokens
            if (error.status === 401) {
                API.clearTokens();
                updateAuthUI(false);
            }
        }
    };

    // Update user display in UI
    const updateUserDisplay = (user) => {
        // Update name displays
        document.querySelectorAll('[data-user="name"]').forEach(el => {
            el.textContent = user.name || 'User';
        });

        // Update avatar displays
        document.querySelectorAll('[data-user="avatar"]').forEach(el => {
            el.textContent = user.avatar || '👤';
        });

        // Update email displays
        document.querySelectorAll('[data-user="email"]').forEach(el => {
            el.textContent = user.email || '';
        });

        // Update goal displays
        document.querySelectorAll('[data-user="goal"]').forEach(el => {
            el.textContent = formatGoal(user.goal) || 'Not set';
        });
    };

    // Format goal for display
    const formatGoal = (goal) => {
        const goals = {
            frontend: 'Frontend Development',
            backend: 'Backend Development',
            fullstack: 'Full Stack Development',
            datascience: 'Data Science',
            ml: 'Machine Learning',
            devops: 'DevOps',
            mobile: 'Mobile Development',
            uiux: 'UI/UX Design'
        };
        return goals[goal] || goal;
    };

    // Get current user from localStorage
    const getUser = () => {
        const userData = localStorage.getItem('internpath_user');
        return userData ? JSON.parse(userData) : null;
    };

    // Check if user is logged in
    const isLoggedIn = () => !!localStorage.getItem('internpath_token');

    // Redirect to login if not authenticated
    const requireAuth = () => {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    };

    return {
        init,
        isLoggedIn,
        getUser,
        requireAuth,
        updateUserDisplay,
        loadUserData
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});

// Make globally available
window.AuthManager = AuthManager;
