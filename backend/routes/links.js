// Platform Links Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

// Valid platforms
const VALID_PLATFORMS = ['linkedin', 'github', 'resume', 'leetcode', 'hackerrank', 'portfolio', 'twitter', 'other'];

/**
 * GET /api/links
 * Get all platform links for user
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('user_platform_links')
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
 * POST /api/links
 * Add new platform link
 */
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { platform, url, is_visible = true } = req.body;

        if (!platform || !url) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Platform and URL are required.'
            });
        }

        if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`
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

        const { data, error } = await supabase
            .from('user_platform_links')
            .upsert({
                user_id: req.user.id,
                platform: platform.toLowerCase(),
                url,
                is_visible
            }, {
                onConflict: 'user_id,platform'
            })
            .select()
            .single();

        if (error) throw error;

        logger.info('Platform link added', { userId: req.user.id, platform });

        res.status(201).json({
            success: true,
            message: 'Link added successfully.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/links/:id
 * Update platform link
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { url, is_visible } = req.body;

        const updates = {};
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
        if (is_visible !== undefined) updates.is_visible = is_visible;

        const { data, error } = await supabase
            .from('user_platform_links')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id) // Ensure user owns this link
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Link not found.'
                });
            }
            throw error;
        }

        res.json({
            success: true,
            message: 'Link updated.',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/links/:id
 * Delete platform link
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('user_platform_links')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Link deleted.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/links/:id/visibility
 * Toggle link visibility
 */
router.put('/:id/visibility', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_visible } = req.body;

        if (typeof is_visible !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'is_visible must be a boolean.'
            });
        }

        const { data, error } = await supabase
            .from('user_platform_links')
            .update({ is_visible })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: `Link ${is_visible ? 'shown' : 'hidden'}.`,
            data
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
