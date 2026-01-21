// Supabase Client Configuration
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Public client (uses anon key, respects RLS)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Admin client (uses service key, bypasses RLS - use carefully!)
const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

module.exports = { supabase, supabaseAdmin };
