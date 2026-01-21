/**
 * Context Fetcher Module
 * Fetches user data from InternPath API endpoints
 */

export class ContextFetcher {
    constructor(config = {}) {
        this.apiBaseUrl = config.apiBaseUrl || '/api';
        this.authToken = config.authToken || null;
        this.useMockData = config.useMockData || false;

        // Cache
        this.cachedContext = null;
        this.cacheExpiry = 0;
        this.cacheDuration = config.cacheDuration || 60000; // 1 minute cache
    }

    /**
     * Set auth token
     */
    setAuthToken(token) {
        this.authToken = token;
        this.clearCache();
    }

    /**
     * Clear cached context
     */
    clearCache() {
        this.cachedContext = null;
        this.cacheExpiry = 0;
    }

    /**
     * Fetch user context from InternPath APIs
     */
    async fetchContext() {
        // Return cached if valid
        if (this.cachedContext && Date.now() < this.cacheExpiry) {
            return this.cachedContext;
        }

        // Return mock data if enabled
        if (this.useMockData) {
            return this.getMockContext();
        }

        try {
            const headers = {};
            if (this.authToken) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            // Fetch all endpoints in parallel
            const [profileRes, skillsRes, streakRes] = await Promise.all([
                fetch(`${this.apiBaseUrl}/users/profile`, { headers }).catch(() => null),
                fetch(`${this.apiBaseUrl}/skills`, { headers }).catch(() => null),
                fetch(`${this.apiBaseUrl}/progress/streak`, { headers }).catch(() => null)
            ]);

            // Parse responses
            const profile = profileRes?.ok ? await profileRes.json() : {};
            const skills = skillsRes?.ok ? await skillsRes.json() : {};
            const streak = streakRes?.ok ? await streakRes.json() : {};

            // Build context object
            const context = this._buildContext(profile, skills, streak);

            // Cache the context
            this.cachedContext = context;
            this.cacheExpiry = Date.now() + this.cacheDuration;

            return context;

        } catch (error) {
            console.warn('Failed to fetch user context, using defaults:', error);
            return this.getDefaultContext();
        }
    }

    /**
     * Build context object from API responses
     */
    _buildContext(profile, skills, streak) {
        const profileData = profile.data || profile || {};
        const skillsData = skills.data || skills || [];
        const streakData = streak.data || streak || {};

        // Calculate skill stats
        const skillsArray = Array.isArray(skillsData) ? skillsData : [];
        const completedSkills = skillsArray.filter(s => s.is_completed || s.completed);
        const inProgressSkills = skillsArray.filter(s => s.progress > 0 && !s.is_completed);

        // Find most recent skill
        const recentSkill = completedSkills.length > 0
            ? completedSkills[completedSkills.length - 1]?.name
            : null;

        // Calculate readiness score
        const readinessScore = skillsArray.length > 0
            ? Math.round((completedSkills.length / skillsArray.length) * 100)
            : 0;

        return {
            // User info
            name: profileData.name || profileData.username || 'there',
            email: profileData.email || null,
            goal: this._formatGoal(profileData.goal || profileData.career_track) || 'tech',

            // Streak info
            streak: streakData.current_streak || streakData.streak || 0,
            longestStreak: streakData.longest_streak || 0,

            // Skills info
            completedSkills: completedSkills.length,
            totalSkills: skillsArray.length,
            inProgressSkills: inProgressSkills.length,
            recentSkill: recentSkill,
            readinessScore: readinessScore,

            // Next recommended skill
            nextSkill: this._getNextRecommendedSkill(skillsArray)
        };
    }

    /**
     * Format goal to readable string
     */
    _formatGoal(goal) {
        if (!goal) return null;

        const goalMap = {
            'frontend': 'Frontend',
            'backend': 'Backend',
            'fullstack': 'Full Stack',
            'datascience': 'Data Science',
            'ml': 'Machine Learning',
            'devops': 'DevOps',
            'mobile': 'Mobile',
            'uiux': 'UI/UX'
        };

        return goalMap[goal.toLowerCase()] || goal;
    }

    /**
     * Get next recommended skill based on progress
     */
    _getNextRecommendedSkill(skills) {
        if (!Array.isArray(skills) || skills.length === 0) return null;

        // Find first incomplete skill
        const nextSkill = skills.find(s => !s.is_completed && !s.completed);
        return nextSkill?.name || null;
    }

    /**
     * Get mock context for demo/testing
     */
    getMockContext() {
        return {
            name: 'Demo User',
            email: 'demo@example.com',
            goal: 'Full Stack',
            streak: 7,
            longestStreak: 14,
            completedSkills: 12,
            totalSkills: 30,
            inProgressSkills: 2,
            recentSkill: 'React Basics',
            readinessScore: 40,
            nextSkill: 'React Hooks'
        };
    }

    /**
     * Get default context when API fails
     */
    getDefaultContext() {
        return {
            name: 'there',
            email: null,
            goal: 'tech',
            streak: 0,
            longestStreak: 0,
            completedSkills: 0,
            totalSkills: 0,
            inProgressSkills: 0,
            recentSkill: null,
            readinessScore: 0,
            nextSkill: null
        };
    }

    /**
     * Update mock context (for demo purposes)
     */
    setMockContext(context) {
        this.useMockData = true;
        this._customMockContext = context;
    }
}

export default ContextFetcher;
