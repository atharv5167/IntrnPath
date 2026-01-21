// Script to check and delete a user by email
require('dotenv').config();
const { supabase, supabaseAdmin } = require('../config/supabase');

const EMAIL_TO_CHECK = 'atharvjadhav4132@mail.com';

async function checkAndDeleteUser() {
    console.log(`\nChecking for user: ${EMAIL_TO_CHECK}\n`);

    try {
        // First, check if user exists in user_profiles
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', EMAIL_TO_CHECK)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking user profile:', profileError);
            return;
        }

        if (!profile) {
            console.log('✅ User NOT found in database. You can register with this email.');
            return;
        }

        console.log('❌ User FOUND in database:');
        console.log('   User ID:', profile.id);
        console.log('   Name:', profile.name);
        console.log('   Email:', profile.email);
        console.log('   Onboarding Completed:', profile.onboarding_completed);
        console.log('\nDeleting user...\n');

        // Delete from user_profiles table
        const { error: deleteProfileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', profile.id);

        if (deleteProfileError) {
            console.error('Error deleting user profile:', deleteProfileError);
        } else {
            console.log('✅ Deleted from user_profiles table');
        }

        // Delete from Supabase Auth using admin client
        if (supabaseAdmin) {
            const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(profile.id);

            if (deleteAuthError) {
                console.error('Error deleting from auth:', deleteAuthError);
            } else {
                console.log('✅ Deleted from Supabase Auth');
            }
        } else {
            console.warn('⚠️  Admin client not available. User may still exist in Supabase Auth.');
            console.log('   You can manually delete from Supabase dashboard if needed.');
        }

        console.log('\n✅ User deletion complete! You can now register with this email.\n');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

checkAndDeleteUser();
