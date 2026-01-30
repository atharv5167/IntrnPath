// Progress & Streaks Routes
const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/progress
 * Get all progress data for user
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get progress data
        const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(90); // Last 90 days

        // Get streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

        res.json({
            success: true,
            data: {
                progress: progress || [],
                streak: streak || {
                    current_streak: 0,
                    longest_streak: 0,
                    last_activity_date: null,
                    freeze_count: 1
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/progress/today
 * Get today's progress
 */
router.get('/today', authMiddleware, async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('date', today)
            .single();

        res.json({
            success: true,
            data: data || {
                date: today,
                skills_completed: [],
                tasks_count: 0,
                time_spent_mins: 0
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/progress/log
 * Log daily activity and update streak
 */
router.post('/log', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { skills_completed, tasks_count, time_spent_mins } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Upsert today's progress
        const { data: progress, error: progressError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                date: today,
                skills_completed: skills_completed || [],
                tasks_count: tasks_count || 0,
                time_spent_mins: time_spent_mins || 0
            }, {
                onConflict: 'user_id,date'
            })
            .select()
            .single();

        if (progressError) throw progressError;

        // Update streak
        const { data: currentStreak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

        let streakData;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (!currentStreak) {
            // First activity ever
            streakData = {
                user_id: userId,
                current_streak: 1,
                longest_streak: 1,
                last_activity_date: today,
                freeze_count: 1
            };
        } else {
            // Normalize last_activity_date to date string for comparison
            const lastActivityDate = currentStreak.last_activity_date
                ? String(currentStreak.last_activity_date).split('T')[0]
                : null;

            if (lastActivityDate === today) {
                // Already logged today
                streakData = currentStreak;
            } else if (lastActivityDate === yesterdayStr) {
                // Consecutive day - extend streak
                const newStreak = currentStreak.current_streak + 1;
                streakData = {
                    ...currentStreak,
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, currentStreak.longest_streak),
                    last_activity_date: today
                };
            } else {
                // Streak broken
                streakData = {
                    ...currentStreak,
                    current_streak: 1,
                    last_activity_date: today
                };
            }
        }

        // Upsert streak
        const { data: streak, error: streakError } = await supabase
            .from('user_streaks')
            .upsert(streakData, { onConflict: 'user_id' })
            .select()
            .single();

        if (streakError) throw streakError;

        logger.info('Progress logged', { userId, date: today, tasksCount: tasks_count });

        res.json({
            success: true,
            message: 'Progress logged successfully!',
            data: {
                progress,
                streak
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/progress/streak
 * Get streak info
 */
router.get('/streak', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        res.json({
            success: true,
            data: data || {
                current_streak: 0,
                longest_streak: 0,
                last_activity_date: null,
                freeze_count: 1
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/progress/streak/freeze
 * Use streak freeze
 */
router.post('/streak/freeze', authMiddleware, async (req, res, next) => {
    try {
        const { data: current } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (!current || current.freeze_count <= 0) {
            return res.status(400).json({
                success: false,
                error: 'No Freezes Available',
                message: 'You have no streak freezes remaining.'
            });
        }

        const { data, error } = await supabase
            .from('user_streaks')
            .update({
                freeze_count: current.freeze_count - 1,
                last_activity_date: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        logger.info('Streak freeze used', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Streak freeze used!',
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/progress/history
 * Get activity history with pagination
 */
router.get('/history', authMiddleware, async (req, res, next) => {
    try {
        const { limit = 30, offset = 0 } = req.query;

        const { data, error, count } = await supabase
            .from('user_progress')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('date', { ascending: false })
            .range(Number(offset), Number(offset) + Number(limit) - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: {
                history: data || [],
                total: count,
                limit: Number(limit),
                offset: Number(offset)
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/progress/weekly
 * Get weekly summary
 */
router.get('/weekly', authMiddleware, async (req, res, next) => {
    try {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .gte('date', weekAgo.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0])
            .order('date', { ascending: true });

        const summary = {
            total_days_active: data?.length || 0,
            total_tasks: data?.reduce((sum, d) => sum + (d.tasks_count || 0), 0) || 0,
            total_time_mins: data?.reduce((sum, d) => sum + (d.time_spent_mins || 0), 0) || 0,
            daily: data || []
        };

        res.json({
            success: true,
            data: summary
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/progress/monthly
 * Get monthly summary
 */
router.get('/monthly', authMiddleware, async (req, res, next) => {
    try {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);

        const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .gte('date', monthAgo.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0])
            .order('date', { ascending: true });

        const summary = {
            total_days_active: data?.length || 0,
            total_tasks: data?.reduce((sum, d) => sum + (d.tasks_count || 0), 0) || 0,
            total_time_mins: data?.reduce((sum, d) => sum + (d.time_spent_mins || 0), 0) || 0,
            daily: data || []
        };

        res.json({
            success: true,
            data: summary
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
