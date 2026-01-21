// Script to check users using admin client
require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function checkUsersWithAdmin() {
    console.log('\n=== Checking users with ADMIN client ===\n');

    if (!supabaseAdmin) {
        console.error('❌ Admin client not configured.');
        return;
    }

    try {
        const { data: profiles, error, count } = await supabaseAdmin
            .from('user_profiles')
            .select('id, name, email, onboarding_completed', { count: 'exact' });

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log(`Found ${count || profiles?.length || 0} users\n`);

        if (profiles && profiles.length > 0) {
            profiles.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Onboarding: ${user.onboarding_completed ? 'Completed' : 'Not completed'}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

checkUsersWithAdmin();
