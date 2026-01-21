// Script to manually create user profiles for existing auth users
require('dotenv').config();
const { supabase, supabaseAdmin } = require('../config/supabase');

async function syncAuthUsersToProfiles() {
    console.log('\n=== Syncing Supabase Auth users to user_profiles ===\n');

    if (!supabaseAdmin) {
        console.error('❌ Admin client not configured. Cannot proceed.');
        return;
    }

    try {
        // Get all users from Supabase Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError);
            return;
        }

        console.log(`Found ${users.length} users in Supabase Auth\n`);

        // Check each user and create profile if missing
        for (const user of users) {
            console.log(`Checking: ${user.email}`);

            // Check if profile exists
            const { data: existingProfile } = await supabaseAdmin
                .from('user_profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (existingProfile) {
                console.log(`  ✅ Profile already exists`);
                continue;
            }

            // Create profile
            const { error: insertError } = await supabaseAdmin
                .from('user_profiles')
                .insert({
                    id: user.id,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    onboarding_completed: false,
                    created_at: user.created_at
                });

            if (insertError) {
                console.error(`  ❌ Failed to create profile:`, insertError.message);
            } else {
                console.log(`  ✅ Created profile successfully`);
            }
        }

        console.log('\n=== Sync complete ===\n');

        // Show final count
        const { data: profiles, count } = await supabaseAdmin
            .from('user_profiles')
            .select('*', { count: 'exact' });

        console.log(`Total profiles in database: ${count || profiles?.length || 0}`);

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

syncAuthUsersToProfiles();
