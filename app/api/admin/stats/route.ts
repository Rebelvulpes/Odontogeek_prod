import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log("=== GET /api/admin/stats ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Error fetching users count:", usersError)
    }

    // Get total courses
    const { count: totalCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })

    if (coursesError) {
      console.error("Error fetching courses count:", coursesError)
    }

    // Get total lessons
    const { count: totalLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })

    if (lessonsError) {
      console.error("Error fetching lessons count:", lessonsError)
    }

    // Calculate total revenue (sum of all course prices * enrollments)
    const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select(`
        courses (
          price
        )
      `)

    let totalRevenue = 0
    if (!enrollmentsError && enrollments) {
      totalRevenue = enrollments.reduce((sum, enrollment) => {
        const coursePrice = enrollment.courses?.price || 0
        return sum + coursePrice
      }, 0)
    }

    const stats = {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalLessons: totalLessons || 0,
      totalRevenue: totalRevenue || 0,
    }

    console.log("Stats calculated:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Internal error in GET /api/admin/stats:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
      data: {
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalRevenue: 0,
      },
    })
  }
}
