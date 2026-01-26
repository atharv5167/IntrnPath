// Supabase Client Configuration - Lazy Initialization with Proxy
const { createClient } = require('@supabase/supabase-js');

// Lazy-initialized clients
let _supabase = null;
let _supabaseAdmin = null;
let _initAttempted = false;
let _initError = null;

function initializeClients() {
    if (_initAttempted) return;
    _initAttempted = true;

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    console.log('[Supabase] Initializing clients...');
    console.log('[Supabase] URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'MISSING');
    console.log('[Supabase] Anon Key:', SUPABASE_ANON_KEY ? 'Present (' + SUPABASE_ANON_KEY.length + ' chars)' : 'MISSING');
    console.log('[Supabase] Service Key:', SUPABASE_SERVICE_KEY ? 'Present' : 'Not set');
    console.log('[Supabase] isVercel:', !!process.env.VERCEL);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        _initError = 'Missing environment variables';
        console.warn('[Supabase] Missing environment variables. Database features will be disabled.');
        return;
    }

    try {
        console.log('[Supabase] Calling createClient for public client...');
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Supabase] Public client created:', !!_supabase);

        if (SUPABASE_SERVICE_KEY) {
            console.log('[Supabase] Calling createClient for admin client...');
            _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            console.log('[Supabase] Admin client created:', !!_supabaseAdmin);
        }
    } catch (error) {
        _initError = error.message;
        console.error('[Supabase] EXCEPTION in createClient:', error.message);
        console.error('[Supabase] Stack:', error.stack);
    }
}

// Getter function to check if client is available (for null checks)
function getSupabase() {
    initializeClients();
    return _supabase;
}

function getSupabaseAdmin() {
    initializeClients();
    return _supabaseAdmin;
}

function getInitError() {
    initializeClients();
    return _initError;
}

// Create proxy object that initializes on first property access
const supabaseProxy = new Proxy({}, {
    get(target, prop) {
        initializeClients();
        if (!_supabase) {
            throw new Error('Supabase client is not configured. Init error: ' + (_initError || 'Unknown'));
        }
        const value = _supabase[prop];
        return typeof value === 'function' ? value.bind(_supabase) : value;
    }
});

const supabaseAdminProxy = new Proxy({}, {
    get(target, prop) {
        initializeClients();
        if (!_supabaseAdmin) {
            return undefined; // Admin is optional
        }
        const value = _supabaseAdmin[prop];
        return typeof value === 'function' ? value.bind(_supabaseAdmin) : value;
    }
});

// Export both proxies and getters
module.exports = {
    supabase: supabaseProxy,
    supabaseAdmin: supabaseAdminProxy,
    getSupabase,
    getSupabaseAdmin,
    getInitError
};
