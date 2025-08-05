import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Client-side Supabase client - ONLY uses public anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client factory - ONLY for API routes
export const createServerClient = () => {
  // This should ONLY be called from server-side code
  if (typeof window !== "undefined") {
    throw new Error("❌ SECURITY ERROR: createServerClient called from client-side")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Helper functions for common operations - CLIENT-SIDE SAFE
export const supabaseHelpers = {
  // Test connection using anon key
  async testConnection() {
    try {
      const { data, error } = await supabase.from("courses").select("count").limit(1)
      return { success: !error, error }
    } catch (error) {
      return { success: false, error }
    }
  },

  // Get public courses using anon key
  async getCourses() {
    const { data, error } = await supabase.from("courses").select("*").eq("status", "published")
    return { data, error }
  },
}
