// User Profile Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/users/profile
 * Get current user's full profile
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Profile not found. Please complete onboarding.'
                });
            }
            throw error;
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
    try {
        const { name, year, branch, goal, avatar, bio, onboarding_completed } = req.body;

        const updates = {
            updated_at: new Date().toISOString()
        };

        // Only include fields that were provided
        if (name !== undefined) updates.name = name;
        if (year !== undefined) updates.year = year;
        if (branch !== undefined) updates.branch = branch;
        if (goal !== undefined) updates.goal = goal;
        if (avatar !== undefined) updates.avatar = avatar;
        if (bio !== undefined) updates.bio = bio;
        if (onboarding_completed !== undefined) updates.onboarding_completed = onboarding_completed;

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            logger.error('Profile update failed', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Update Failed',
                message: 'Failed to update profile.'
            });
        }

        logger.info('Profile updated', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/users/avatar
 * Update user avatar
 */
router.put('/avatar', authMiddleware, async (req, res, next) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Avatar is required.'
            });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ avatar, updated_at: new Date().toISOString() })
            .eq('id', req.user.id)
            .select('avatar')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Avatar updated.',
            data: { avatar: data.avatar }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/users/bio
 * Update user bio
 */
router.put('/bio', authMiddleware, async (req, res, next) => {
    try {
        const { bio } = req.body;

        if (bio && bio.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Bio cannot exceed 500 characters.'
            });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ bio, updated_at: new Date().toISOString() })
            .eq('id', req.user.id)
            .select('bio')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Bio updated.',
            data: { bio: data.bio }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/users/export
 * Export all user data (GDPR compliance)
 */
router.get('/export', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch all user data from different tables
        const [profile, skills, progress, links, projects] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('id', userId).single(),
            supabase.from('user_skills').select('*').eq('user_id', userId),
            supabase.from('user_progress').select('*').eq('user_id', userId),
            supabase.from('user_platform_links').select('*').eq('user_id', userId),
            supabase.from('user_projects').select('*').eq('user_id', userId)
        ]);

        const exportData = {
            exported_at: new Date().toISOString(),
            profile: profile.data,
            skills: skills.data || [],
            progress: progress.data || [],
            platform_links: links.data || [],
            projects: projects.data || []
        };

        logger.info('User data exported', { userId });

        res.json({
            success: true,
            data: exportData
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
