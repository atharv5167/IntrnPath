// Analytics Routes
const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/analytics/dashboard
 * Get dashboard overview stats
 */
router.get('/dashboard', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Parallel fetch all data
        const [profile, skills, streak, recentProgress] = await Promise.all([
            supabase.from('user_profiles').select('goal, onboarding_completed').eq('id', userId).single(),
            supabase.from('user_skills').select('*').eq('user_id', userId),
            supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
            supabase.from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(7)
        ]);

        const completedSkills = skills.data?.filter(s => s.is_completed).length || 0;
        const totalSkills = skills.data?.length || 0;
        const completionRate = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

        res.json({
            success: true,
            data: {
                goal: profile.data?.goal,
                skills_completed: completedSkills,
                total_skills: totalSkills,
                completion_rate: completionRate,
                current_streak: streak.data?.current_streak || 0,
                longest_streak: streak.data?.longest_streak || 0,
                recent_activity: recentProgress.data || []
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/analytics/completion-rate
 * Get detailed completion rate breakdown
 */
router.get('/completion-rate', authMiddleware, async (req, res, next) => {
    try {
        const { data: skills } = await supabase
            .from('user_skills')
            .select('skill_id, proficiency, is_completed, progress_percent')
            .eq('user_id', req.user.id);

        const total = skills?.length || 0;
        const completed = skills?.filter(s => s.is_completed).length || 0;
        const inProgress = skills?.filter(s => !s.is_completed && s.progress_percent > 0).length || 0;
        const notStarted = total - completed - inProgress;

        res.json({
            success: true,
            data: {
                total,
                completed,
                in_progress: inProgress,
                not_started: notStarted,
                completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
                by_proficiency: {
                    beginner: skills?.filter(s => s.proficiency === 'beginner').length || 0,
                    intermediate: skills?.filter(s => s.proficiency === 'intermediate').length || 0,
                    advanced: skills?.filter(s => s.proficiency === 'advanced').length || 0
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/analytics/time-spent
 * Get learning time statistics
 */
router.get('/time-spent', authMiddleware, async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data } = await supabase
            .from('user_progress')
            .select('date, time_spent_mins')
            .eq('user_id', req.user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

        const totalMins = data?.reduce((sum, d) => sum + (d.time_spent_mins || 0), 0) || 0;
        const avgMins = data?.length > 0 ? Math.round(totalMins / data.length) : 0;

        res.json({
            success: true,
            data: {
                period_days: days,
                total_minutes: totalMins,
                total_hours: Math.round(totalMins / 60 * 10) / 10,
                average_daily_minutes: avgMins,
                daily: data || []
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/analytics/trends
 * Get progress trends over time
 */
router.get('/trends', authMiddleware, async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: progress } = await supabase
            .from('user_progress')
            .select('date, tasks_count, skills_completed')
            .eq('user_id', req.user.id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: true });

        // Calculate 7-day moving average
        const weeklyAverages = [];
        for (let i = 0; i < progress?.length; i++) {
            const weekStart = Math.max(0, i - 6);
            const weekData = progress.slice(weekStart, i + 1);
            const avgTasks = weekData.reduce((sum, d) => sum + (d.tasks_count || 0), 0) / weekData.length;
            weeklyAverages.push({
                date: progress[i].date,
                average_tasks: Math.round(avgTasks * 10) / 10
            });
        }

        res.json({
            success: true,
            data: {
                daily: progress || [],
                weekly_averages: weeklyAverages
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/analytics/heatmap
 * Get activity heatmap data
 */
router.get('/heatmap', authMiddleware, async (req, res, next) => {
    try {
        const { year, month } = req.query;

        let startDate, endDate;
        if (year && month) {
            // Explicitly parse to integers for Date constructor
            const yearNum = parseInt(year, 10);
            const monthNum = parseInt(month, 10);
            startDate = new Date(yearNum, monthNum - 1, 1);
            endDate = new Date(yearNum, monthNum, 0); // Last day of month
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        const { data } = await supabase
            .from('user_progress')
            .select('date, tasks_count, skills_completed')
            .eq('user_id', req.user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);

        // Convert to heatmap format
        const heatmapData = {};
        data?.forEach(d => {
            const intensity = Math.min(4, Math.floor((d.tasks_count || 0) / 2) + 1);
            heatmapData[d.date] = {
                tasks: d.tasks_count || 0,
                skills: d.skills_completed?.length || 0,
                intensity // 0-4 scale for heatmap coloring
            };
        });

        res.json({
            success: true,
            data: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                days: heatmapData
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/analytics/internship-readiness
 * Calculate internship readiness score
 */
router.get('/internship-readiness', authMiddleware, async (req, res, next) => {
    try {
        const [profile, skills, streak] = await Promise.all([
            supabase.from('user_profiles').select('goal').eq('id', req.user.id).single(),
            supabase.from('user_skills').select('*').eq('user_id', req.user.id),
            supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', req.user.id).single()
        ]);

        // Calculate readiness score based on:
        // - Skill completion (50%)
        // - Proficiency levels (30%)
        // - Consistency/streaks (20%)

        const totalSkills = skills.data?.length || 0;
        const completedSkills = skills.data?.filter(s => s.is_completed).length || 0;
        const advancedSkills = skills.data?.filter(s => s.proficiency === 'advanced').length || 0;
        const intermediateSkills = skills.data?.filter(s => s.proficiency === 'intermediate').length || 0;

        const completionScore = totalSkills > 0 ? (completedSkills / totalSkills) * 50 : 0;
        const proficiencyScore = totalSkills > 0
            ? ((advancedSkills * 1 + intermediateSkills * 0.5) / totalSkills) * 30
            : 0;
        const streakScore = Math.min(20, (streak.data?.longest_streak || 0) * 2);

        const readinessScore = Math.round(completionScore + proficiencyScore + streakScore);

        res.json({
            success: true,
            data: {
                readiness_score: readinessScore,
                breakdown: {
                    skills_completion: Math.round(completionScore),
                    proficiency_level: Math.round(proficiencyScore),
                    consistency: Math.round(streakScore)
                },
                stats: {
                    total_skills: totalSkills,
                    completed: completedSkills,
                    advanced: advancedSkills,
                    intermediate: intermediateSkills,
                    current_streak: streak.data?.current_streak || 0
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
