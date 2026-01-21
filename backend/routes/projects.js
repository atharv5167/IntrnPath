// Projects Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/projects
 * Get all user projects
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('user_projects')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

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
 * POST /api/projects
 * Add new project
 */
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { title, url, description, tech_stack, is_featured = false, thumbnail_url } = req.body;

        if (!title || !url) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Title and URL are required.'
            });
        }

        // URL validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Invalid URL format.'
            });
        }

        // If this is being featured, unfeatured any existing featured project
        if (is_featured) {
            await supabase
                .from('user_projects')
                .update({ is_featured: false })
                .eq('user_id', req.user.id)
                .eq('is_featured', true);
        }

        const { data, error } = await supabase
            .from('user_projects')
            .insert({
                user_id: req.user.id,
                title,
                url,
                description: description || null,
                tech_stack: tech_stack || [],
                is_featured,
                thumbnail_url: thumbnail_url || null
            })
            .select()
            .single();

        if (error) throw error;

        logger.info('Project added', { userId: req.user.id, title });

        res.status(201).json({
            success: true,
            message: 'Project added successfully.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, url, description, tech_stack, thumbnail_url } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (url !== undefined) {
            try {
                new URL(url);
                updates.url = url;
            } catch {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid URL format.'
                });
            }
        }
        if (description !== undefined) updates.description = description;
        if (tech_stack !== undefined) updates.tech_stack = tech_stack;
        if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;

        const { data, error } = await supabase
            .from('user_projects')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Project not found.'
                });
            }
            throw error;
        }

        res.json({
            success: true,
            message: 'Project updated.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('user_projects')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Project deleted.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/projects/:id/feature
 * Toggle project featured status
 */
router.put('/:id/feature', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_featured } = req.body;

        if (typeof is_featured !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'is_featured must be a boolean.'
            });
        }

        // If featuring, unfeatured any existing
        if (is_featured) {
            await supabase
                .from('user_projects')
                .update({ is_featured: false })
                .eq('user_id', req.user.id)
                .eq('is_featured', true);
        }

        const { data, error } = await supabase
            .from('user_projects')
            .update({ is_featured })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: is_featured ? 'Project featured!' : 'Project unfeatured.',
            data
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
