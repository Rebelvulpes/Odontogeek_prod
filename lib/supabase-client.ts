import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from("courses").select("count").limit(1)

      return { success: !error, error }
    } catch (error) {
      return { success: false, error }
    }
  },

  // Create user
  async createUser(userData: {
    email: string
    firstName: string
    lastName: string
    role?: string
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || "student",
        },
      ])
      .select()

    return { data, error }
  },

  // Get courses
  async getCourses() {
    const { data, error } = await supabase.from("courses").select("*").eq("status", "published")

    return { data, error }
  },

  // Enroll user in course
  async enrollUser(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from("enrollments")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
        },
      ])
      .select()

    return { data, error }
  },
}
