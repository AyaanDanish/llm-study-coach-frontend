import { createClient } from "@supabase/supabase-js"

// Use fallback values for development/preview environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Only show warning in development if variables are missing
if (
  typeof window !== "undefined" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  console.warn("Supabase environment variables not found. Using placeholder values for development.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type StudyMaterial = {
  id: string
  name: string
  subject: string
  file_path: string
  file_size: number
  uploaded_at: string
  user_id: string
  file_type: string
}
