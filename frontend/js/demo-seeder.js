/**
 * InternPath Demo Data Seeder
 * 
 * Run this script in the browser console to populate 30 days of demo progress data
 * This allows testing of analytics features like streaks, heatmap, category progress, etc.
 * 
 * Usage: Copy and paste this entire script into the browser console on the dashboard page
 */

(function seedDemoData() {
    console.log('🌱 Starting InternPath Demo Data Seeder...\n');

    // Demo user data (in case not already set)
    const demoUser = {
        id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        email: 'demo@internpath.test',
        goal: 'backend',
        year: '2',
        currentSkills: {
            python: 'intermediate',
            javascript: 'beginner',
            git: 'intermediate',
            sql: 'beginner'
        },
        onboarding_completed: true,
        avatar: '👨‍💻'
    };

    // Check if user data exists, if not create it
    if (!localStorage.getItem('internpath_user')) {
        localStorage.setItem('internpath_user', JSON.stringify(demoUser));
        console.log('✅ Created demo user');
    } else {
        console.log('ℹ️ User already exists, using existing user');
    }

    // Generate 30 days of progress history
    const today = new Date();
    const progressHistory = {};
    const completedSkills = [];

    // Sample skills to mark as completed over time
    const allSkills = [
        'python_basics', 'data_structures', 'algorithms', 'oop',
        'sql_basics', 'postgresql', 'mongodb', 'orm',
        'rest_api', 'nodejs', 'auth', 'graphql',
        'git', 'docker', 'ci_cd', 'cloud'
    ];

    // Generate daily progress for the past 30 days
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Random chance of activity each day (70% chance)
        const hadActivity = Math.random() > 0.3;

        if (hadActivity) {
            // Random number of completions (1-3 per active day)
            const completions = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < completions; j++) {
                // Add a random skill if not already completed
                const availableSkills = allSkills.filter(s => !completedSkills.includes(s));
                if (availableSkills.length > 0) {
                    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                    completedSkills.push(randomSkill);
                }
            }

            progressHistory[dateKey] = {
                completed: completions,
                skills: completedSkills.slice(-completions),
                timestamp: date.toISOString()
            };
        }
    }

    // Create the progress object
    const progress = {
        completedSkills: completedSkills,
        history: progressHistory,
        currentStreak: calculateStreak(progressHistory, today),
        longestStreak: 0,
        lastActivityDate: today.toISOString().split('T')[0],
        totalHoursLearned: Math.floor(completedSkills.length * 3.5),
        weeklyGoal: 5,
        weeklyCompleted: countThisWeek(progressHistory, today)
    };

    // Calculate longest streak
    progress.longestStreak = calculateLongestStreak(progressHistory);

    // Save to localStorage
    localStorage.setItem('internpath_progress', JSON.stringify(progress));
    console.log('✅ Created 30 days of progress history');
    console.log(`   📊 Total skills completed: ${completedSkills.length}`);
    console.log(`   🔥 Current streak: ${progress.currentStreak} days`);
    console.log(`   🏆 Longest streak: ${progress.longestStreak} days`);
    console.log(`   📅 Days with activity: ${Object.keys(progressHistory).length}`);

    // Create daily schedule data
    const schedule = {};
    for (let i = 0; i < 14; i++) { // Next 2 weeks
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        // Assign 1-2 skills per day
        const remaining = allSkills.filter(s => !completedSkills.includes(s));
        if (remaining.length > 0) {
            const dailySkills = remaining.slice(0, Math.min(2, remaining.length));
            schedule[dateKey] = dailySkills.map(id => ({
                skillId: id,
                scheduled: true,
                completed: false
            }));
        }
    }
    localStorage.setItem('internpath_schedule', JSON.stringify(schedule));
    console.log('✅ Created 2-week learning schedule');

    // Create some coding stats
    const codingStats = {
        leetcode: Math.floor(Math.random() * 50) + 10,
        hackerrank: Math.floor(Math.random() * 30) + 5,
        lastUpdated: today.toISOString()
    };
    localStorage.setItem('internpath_coding_stats', JSON.stringify(codingStats));
    console.log(`✅ Created coding stats (LeetCode: ${codingStats.leetcode}, HackerRank: ${codingStats.hackerrank})`);

    console.log('\n🎉 Demo data seeding complete!');
    console.log('🔄 Refreshing page in 2 seconds to show updated data...\n');

    // Refresh after 2 seconds
    setTimeout(() => {
        window.location.reload();
    }, 2000);

    // Helper functions
    function calculateStreak(history, today) {
        let streak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dateKey = checkDate.toISOString().split('T')[0];
            if (history[dateKey]) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    function calculateLongestStreak(history) {
        const dates = Object.keys(history).sort();
        let longest = 0;
        let current = 0;
        let lastDate = null;

        for (const dateStr of dates) {
            const date = new Date(dateStr);
            if (lastDate) {
                const diff = (date - lastDate) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    current++;
                } else {
                    longest = Math.max(longest, current);
                    current = 1;
                }
            } else {
                current = 1;
            }
            lastDate = date;
        }
        return Math.max(longest, current);
    }

    function countThisWeek(history, today) {
        let count = 0;
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

        for (const dateStr of Object.keys(history)) {
            const date = new Date(dateStr);
            if (date >= weekStart && date <= today) {
                count += history[dateStr].completed;
            }
        }
        return count;
    }
})();
