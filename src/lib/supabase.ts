const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

let _client: any = null;
let _clientPromise: Promise<any> | null = null;

export async function getSupabase() {
  if (_client) return _client;
  
  // If a promise is already being created, wait for it instead of creating another
  if (_clientPromise) return _clientPromise;
  
  if (!supabaseUrl || !supabaseAnonKey) return null;
  
  // Create the promise and store it to prevent race conditions
  _clientPromise = (async () => {
    // Double-check after await in case another call created it
    if (_client) return _client;
    
    // Dynamically import to keep Supabase out of the initial bundle
    const mod = await import('@supabase/supabase-js');
    _client = mod.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return _client;
  })();

  return _clientPromise;

// Synchronous fallback for code paths that need a check but can't await
export function getSupabaseSync() {
  return _client;
}

