import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

// Server-side database client with service role key
export const db = createClient(supabaseUrl, supabaseServiceKey)

// Helper functions for common database operations
export const dbHelpers = {
  // Get all published courses
  async getCourses() {
    const { data, error } = await db
      .from("courses")
      .select("*")
      .eq("status", "published")
      .neq("archived", true)
      .order("created_at", { ascending: false })

    return { data, error }
  },

  // Get course by ID
  async getCourseById(id: string) {
    const { data, error } = await db.from("courses").select("*").eq("id", id).single()

    return { data, error }
  },

  // Get lessons for a course
  async getLessonsByCourseId(courseId: string) {
    const { data, error } = await db
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .neq("archived", true)
      .order("order_index", { ascending: true })

    return { data, error }
  },

  // Get user enrollments
  async getUserEnrollments(userId: string) {
    const { data, error } = await db
      .from("enrollments")
      .select(`
        *,
        courses (*)
      `)
      .eq("user_id", userId)

    return { data, error }
  },
}
