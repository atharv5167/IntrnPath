// Skills & Roadmap Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/skills
 * Get all user skills
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: data || []
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/skills/roadmap
 * Get personalized roadmap based on user goal
 */
router.get('/roadmap', authMiddleware, async (req, res, next) => {
    try {
        // Get user profile to get their goal
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('goal')
            .eq('id', req.user.id)
            .single();

        if (profileError) throw profileError;

        // Get user's current skills
        const { data: skills, error: skillsError } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', req.user.id);

        if (skillsError) throw skillsError;

        res.json({
            success: true,
            data: {
                goal: profile.goal,
                skills: skills || [],
                // The actual roadmap logic is handled by frontend
                // This just provides the data needed
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/skills/:skillId
 * Get single skill details
 */
router.get('/:skillId', authMiddleware, async (req, res, next) => {
    try {
        const { skillId } = req.params;

        const { data, error } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('skill_id', skillId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.json({
                    success: true,
                    data: null // Skill not tracked yet
                });
            }
            throw error;
        }

        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/skills/:skillId
 * Update skill progress
 */
router.put('/:skillId', authMiddleware, async (req, res, next) => {
    try {
        const { skillId } = req.params;
        const { proficiency, progress_percent, notes } = req.body;

        // Upsert skill
        const { data, error } = await supabase
            .from('user_skills')
            .upsert({
                user_id: req.user.id,
                skill_id: skillId,
                proficiency: proficiency || 'beginner',
                progress_percent: progress_percent || 0,
                notes: notes || null
            }, {
                onConflict: 'user_id,skill_id'
            })
            .select()
            .single();

        if (error) throw error;

        logger.info('Skill updated', { userId: req.user.id, skillId });

        res.json({
            success: true,
            message: 'Skill progress updated.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/skills/:skillId/complete
 * Mark skill as completed
 */
router.post('/:skillId/complete', authMiddleware, async (req, res, next) => {
    try {
        const { skillId } = req.params;

        const { data, error } = await supabase
            .from('user_skills')
            .upsert({
                user_id: req.user.id,
                skill_id: skillId,
                is_completed: true,
                progress_percent: 100,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,skill_id'
            })
            .select()
            .single();

        if (error) throw error;

        logger.info('Skill completed', { userId: req.user.id, skillId });

        res.json({
            success: true,
            message: 'Skill marked as completed!',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/skills/:skillId/uncomplete
 * Unmark skill completion
 */
router.post('/:skillId/uncomplete', authMiddleware, async (req, res, next) => {
    try {
        const { skillId } = req.params;

        const { data, error } = await supabase
            .from('user_skills')
            .update({
                is_completed: false,
                completed_at: null
            })
            .eq('user_id', req.user.id)
            .eq('skill_id', skillId)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({
            success: true,
            message: 'Skill unmarked.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/skills/:skillId/notes
 * Update skill notes
 */
router.put('/:skillId/notes', authMiddleware, async (req, res, next) => {
    try {
        const { skillId } = req.params;
        const { notes } = req.body;

        const { data, error } = await supabase
            .from('user_skills')
            .upsert({
                user_id: req.user.id,
                skill_id: skillId,
                notes
            }, {
                onConflict: 'user_id,skill_id'
            })
            .select('skill_id, notes')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Notes updated.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/skills/recommendations
 * Get skill recommendations based on progress
 */
router.get('/recommendations', authMiddleware, async (req, res, next) => {
    try {
        // Get user's completed and in-progress skills
        const { data: skills } = await supabase
            .from('user_skills')
            .select('skill_id, is_completed, proficiency')
            .eq('user_id', req.user.id);

        // For now, return empty array - frontend handles recommendation logic
        res.json({
            success: true,
            data: {
                skills: skills || [],
                recommendations: [] // To be implemented based on skill dependencies
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
