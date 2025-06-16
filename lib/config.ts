const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

export default config 