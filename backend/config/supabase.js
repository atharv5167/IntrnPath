// Supabase Client Configuration
const { createClient } = require('@supabase/supabase-js');

// Check for environment variables (warn instead of throw to allow health checks)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
let supabaseAdmin = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Database features will be disabled.');
} else {
    // Public client (uses anon key, respects RLS)
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Admin client (uses service key, bypasses RLS - use carefully!)
    if (SUPABASE_SERVICE_KEY) {
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    }
}

module.exports = { supabase, supabaseAdmin };

