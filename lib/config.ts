const config = {
    apiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:5000',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

export default config