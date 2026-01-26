// Roadmap Routes - User's custom roadmap and schedule persistence
const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/roadmap
 * Get user's saved roadmap data (modified template + schedule)
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('user_roadmaps')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({
            success: true,
            data: data || null
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/roadmap
 * Save/update user's modified roadmap template
 */
router.put('/', authMiddleware, async (req, res, next) => {
    try {
        const { modified_template, schedule } = req.body;

        const upsertData = {
            user_id: req.user.id,
            updated_at: new Date().toISOString()
        };

        if (modified_template !== undefined) {
            upsertData.modified_template = modified_template;
        }
        if (schedule !== undefined) {
            upsertData.schedule = schedule;
        }

        const { data, error } = await supabase
            .from('user_roadmaps')
            .upsert(upsertData, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        logger.info('Roadmap saved', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Roadmap saved successfully.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/roadmap
 * Reset user's roadmap to default
 */
router.delete('/', authMiddleware, async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('user_roadmaps')
            .delete()
            .eq('user_id', req.user.id);

        if (error && error.code !== 'PGRST116') throw error;

        logger.info('Roadmap reset', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Roadmap reset to default.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/roadmap/full
 * Get all user data needed for dashboard (profile, skills, progress, roadmap)
 * This is the main sync endpoint - fetches everything in one call
 */
router.get('/full', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch all user data in parallel
        const [profileResult, skillsResult, progressResult, streakResult, roadmapResult] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('id', userId).single(),
            supabase.from('user_skills').select('*').eq('user_id', userId),
            supabase.from('user_progress').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
            supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
            supabase.from('user_roadmaps').select('*').eq('user_id', userId).single()
        ]);

        // Extract completed skill IDs
        const completedSkills = (skillsResult.data || [])
            .filter(s => s.is_completed)
            .map(s => s.skill_id);

        res.json({
            success: true,
            data: {
                profile: profileResult.data || null,
                skills: skillsResult.data || [],
                completedSkills,
                progress: progressResult.data || [],
                streak: streakResult.data || {
                    current_streak: 0,
                    longest_streak: 0,
                    last_activity_date: null,
                    freeze_count: 1
                },
                roadmap: roadmapResult.data || null
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
