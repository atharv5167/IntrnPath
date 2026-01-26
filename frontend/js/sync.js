/**
 * InternPath Data Sync Module
 * Syncs localStorage with Supabase backend (online-first approach)
 * 
 * This module handles:
 * - Loading all user data from API on login
 * - Saving progress/skills to API when changes occur
 * - Keeping localStorage as a cache for quick access
 */

const DataSync = {
    API_BASE: '/api',
    isOnline: true,
    syncInProgress: false,

    /**
     * Get auth token from localStorage
     */
    getToken() {
        return localStorage.getItem('internpath_token');
    },

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        const token = this.getToken();
        if (!token) {
            console.warn('[Sync] No auth token available');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`[Sync] API error: ${endpoint}`, data);
                return { success: false, error: data.message || 'API error' };
            }

            return data;
        } catch (error) {
            console.error(`[Sync] Network error: ${endpoint}`, error);
            this.isOnline = false;
            return { success: false, error: 'Network error' };
        }
    },

    /**
     * Load all user data from API (called on login)
     * This is the main sync-down function
     */
    async loadAllUserData() {
        console.log('[Sync] Loading all user data from API...');

        const result = await this.apiRequest('/roadmap/full');

        if (!result.success) {
            console.warn('[Sync] Failed to load user data, using localStorage fallback');
            return false;
        }

        const { profile, skills, completedSkills, progress, streak, roadmap } = result.data;

        // Update localStorage with server data (but preserve existing if profile is null)
        if (profile) {
            const userData = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                year: profile.year,
                branch: profile.branch,
                goal: profile.goal,
                currentSkills: profile.current_skills || {},
                weeklyHours: profile.weekly_hours || 10,
                onboardingCompleted: profile.onboarding_completed
            };
            localStorage.setItem('internpath_user', JSON.stringify(userData));
        } else {
            console.log('[Sync] Profile not found in DB, keeping existing localStorage user data');
        }

        // Update progress with completed skills - but preserve existing if API returns empty
        const existingProgress = JSON.parse(localStorage.getItem('internpath_progress') || '{}');

        // Only update progress if API returned actual data
        if (completedSkills && completedSkills.length > 0) {
            const progressData = {
                completedSkills: completedSkills,
                tasks: existingProgress.tasks || [],
                streakData: {
                    current: streak?.current_streak || 0,
                    longest: streak?.longest_streak || 0,
                    lastActive: streak?.last_activity_date || null,
                    freezeCount: streak?.freeze_count || 1
                }
            };
            localStorage.setItem('internpath_progress', JSON.stringify(progressData));
        } else if (streak) {
            // Update only streak data if we have it from API but no completed skills in DB
            existingProgress.streakData = {
                current: streak?.current_streak || existingProgress.streakData?.current || 0,
                longest: streak?.longest_streak || existingProgress.streakData?.longest || 0,
                lastActive: streak?.last_activity_date || existingProgress.streakData?.lastActive || null,
                freezeCount: streak?.freeze_count || existingProgress.streakData?.freezeCount || 1
            };
            localStorage.setItem('internpath_progress', JSON.stringify(existingProgress));
            console.log('[Sync] No completed skills in DB, keeping existing localStorage progress');
        }

        // Handle Roadmap Sync (Bidirectional)
        const localRoadmapStr = localStorage.getItem('internpath_modified_roadmap');
        const localScheduleStr = localStorage.getItem('internpath_schedule');

        if (roadmap?.modified_template) {
            // Case 1: Server has data -> Sync DOWN (Server Authority)
            localStorage.setItem('internpath_modified_roadmap', JSON.stringify(roadmap.modified_template));
            if (roadmap.schedule) {
                localStorage.setItem('internpath_schedule', JSON.stringify(roadmap.schedule));
            }
        } else if (localRoadmapStr) {
            // Case 2: Server empty but Local has data -> Sync UP (Auto-recovery)
            console.log('[Sync] Server has no roadmap. Syncing local roadmap to server...');

            try {
                const template = JSON.parse(localRoadmapStr);
                const schedule = localScheduleStr ? JSON.parse(localScheduleStr) : null;

                // Trigger upload in background
                this.saveRoadmap(template, schedule);
            } catch (err) {
                console.error('[Sync] Error parsing local roadmap for auto-sync:', err);
            }
        }

        console.log('[Sync] User data loaded successfully', {
            completedSkills: completedSkills?.length || 0,
            hasCustomRoadmap: !!roadmap?.modified_template
        });

        this.isOnline = true;
        return true;
    },

    /**
     * Save skill completion to API
     */
    async completeSkill(skillId) {
        console.log('[Sync] Marking skill as completed:', skillId);

        // Update localStorage immediately for responsiveness
        const progress = JSON.parse(localStorage.getItem('internpath_progress') || '{}');
        if (!progress.completedSkills) progress.completedSkills = [];
        if (!progress.completedSkills.includes(skillId)) {
            progress.completedSkills.push(skillId);
            localStorage.setItem('internpath_progress', JSON.stringify(progress));
        }

        // Sync to API
        const result = await this.apiRequest(`/skills/${skillId}/complete`, {
            method: 'POST'
        });

        if (!result.success) {
            console.warn('[Sync] Failed to sync skill completion to server');
        }

        // Also log progress for streak tracking
        await this.logDailyProgress();

        return result.success;
    },

    /**
     * Uncomplete a skill
     */
    async uncompleteSkill(skillId) {
        console.log('[Sync] Unmarking skill:', skillId);

        // Update localStorage
        const progress = JSON.parse(localStorage.getItem('internpath_progress') || '{}');
        if (progress.completedSkills) {
            progress.completedSkills = progress.completedSkills.filter(id => id !== skillId);
            localStorage.setItem('internpath_progress', JSON.stringify(progress));
        }

        // Sync to API
        const result = await this.apiRequest(`/skills/${skillId}/uncomplete`, {
            method: 'POST'
        });

        return result.success;
    },

    /**
     * Log daily progress (updates streak)
     */
    async logDailyProgress() {
        const progress = JSON.parse(localStorage.getItem('internpath_progress') || '{}');

        const result = await this.apiRequest('/progress/log', {
            method: 'POST',
            body: JSON.stringify({
                skills_completed: progress.completedSkills || [],
                tasks_count: progress.completedSkills?.length || 0,
                time_spent_mins: 0
            })
        });

        if (result.success && result.data?.streak) {
            // Update localStorage with new streak data
            progress.streakData = {
                current: result.data.streak.current_streak,
                longest: result.data.streak.longest_streak,
                lastActive: result.data.streak.last_activity_date,
                freezeCount: result.data.streak.freeze_count
            };
            localStorage.setItem('internpath_progress', JSON.stringify(progress));
        }

        return result.success;
    },

    /**
     * Save modified roadmap to API
     */
    async saveRoadmap(modifiedTemplate, schedule = null) {
        console.log('[Sync] Saving roadmap to API...');

        // Update localStorage
        if (modifiedTemplate) {
            localStorage.setItem('internpath_modified_roadmap', JSON.stringify(modifiedTemplate));
        }
        if (schedule) {
            localStorage.setItem('internpath_schedule', JSON.stringify(schedule));
        }

        // Sync to API
        const result = await this.apiRequest('/roadmap', {
            method: 'PUT',
            body: JSON.stringify({
                modified_template: modifiedTemplate,
                schedule: schedule
            })
        });

        return result.success;
    },

    /**
     * Save user profile updates
     */
    async saveProfile(profileData) {
        console.log('[Sync] Saving profile to API...');

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('internpath_user') || '{}');
        Object.assign(userData, profileData);
        localStorage.setItem('internpath_user', JSON.stringify(userData));

        // Sync to API
        const result = await this.apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        return result.success;
    },

    /**
     * Clear all synced data (called on logout)
     */
    clearLocalData() {
        console.log('[Sync] Clearing local data...');
        localStorage.removeItem('internpath_user');
        localStorage.removeItem('internpath_progress');
        localStorage.removeItem('internpath_schedule');
        localStorage.removeItem('internpath_modified_roadmap');
        localStorage.removeItem('internpath_profile');
        localStorage.removeItem('internpath_coding_stats');
    }
};

// Make DataSync available globally
window.DataSync = DataSync;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSync;
}
