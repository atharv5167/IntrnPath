// Script to check all users in the database
require('dotenv').config();
const { supabase } = require('../config/supabase');

async function listAllUsers() {
    console.log('\n=== Checking all users in database ===\n');

    try {
        const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('id, name, email, onboarding_completed, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('❌ No users found in database');
            return;
        }

        console.log(`✅ Found ${profiles.length} user(s):\n`);

        profiles.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   User ID: ${user.id}`);
            console.log(`   Onboarding: ${user.onboarding_completed ? 'Completed' : 'Not completed'}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log('');
        });

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

listAllUsers();
