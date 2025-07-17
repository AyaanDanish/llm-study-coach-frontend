// Function to determine the appropriate API URL
const getApiUrl = (): string => {
  // If environment variable is set, use it (for manual overrides)
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL;
  }

  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running on localhost or 127.0.0.1, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000';
    }
    
    // If deployed on Vercel or any other domain, use deployed backend
    return 'https://llm-study-coach-backend.vercel.app';
  }
  
  // Server-side rendering fallback - use deployed backend
  return 'https://llm-study-coach-backend.vercel.app';
};

const config = {
    apiUrl: getApiUrl(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔧 API URL configured as:', config.apiUrl);
}

export default config