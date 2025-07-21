import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie } from "@/lib/server-utils"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT COURSES REQUEST ===")

    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ NO VALID SESSION FOUND")
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    console.log("✅ VALID SESSION FOUND for user:", userSession.email)

    // Check if user is admin
    const { data: adminCheck } = await supabase.rpc("is_user_admin", { user_id: userSession.id })

    const isAdmin = adminCheck || false
    console.log("🔍 Is Admin:", isAdmin)

    let coursesData = []

    if (isAdmin) {
      // Admin gets all courses automatically
      console.log("👑 ADMIN ACCESS - Getting all courses")

      const { data: allCourses, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          course_tags (
            course_tag_options (
              id,
              name,
              color
            )
          )
        `)
        .eq("archived", false)
        .order("created_at", { ascending: false })

      if (coursesError) {
        console.error("❌ Error fetching courses:", coursesError)
        return NextResponse.json({ success: false, message: "Error al obtener cursos" }, { status: 500 })
      }

      // Format courses for admin with special access indicator
      coursesData =
        allCourses?.map((course) => ({
          ...course,
          enrollment_status: "admin_access",
          progress_percentage: 100,
          access_type: "admin",
          tags: course.course_tags?.map((ct: any) => ct.course_tag_options) || [],
        })) || []

      // Log admin access
      await supabase.from("student_access_logs").insert({
        user_id: userSession.id,
        course_id: null,
        lesson_id: null,
        access_type: "admin",
        success: true,
        details: { action: "view_all_courses", admin_access: true },
      })
    } else {
      // Regular student - get enrolled courses
      console.log("👨‍🎓 STUDENT ACCESS - Getting enrolled courses")

      const { data: enrolledCourses, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (
            *,
            course_tags (
              course_tag_options (
                id,
                name,
                color
              )
            )
          )
        `)
        .eq("user_id", userSession.id)
        .eq("status", "active")

      if (enrollmentError) {
        console.error("❌ Error fetching enrollments:", enrollmentError)
        return NextResponse.json({ success: false, message: "Error al obtener inscripciones" }, { status: 500 })
      }

      // Format enrolled courses
      coursesData =
        enrolledCourses?.map((enrollment) => ({
          ...enrollment.courses,
          enrollment_status: enrollment.status,
          progress_percentage: enrollment.progress_percentage || 0,
          access_type: "enrolled",
          enrolled_at: enrollment.created_at,
          tags: enrollment.courses?.course_tags?.map((ct: any) => ct.course_tag_options) || [],
        })) || []

      // Log student access
      await supabase.from("student_access_logs").insert({
        user_id: userSession.id,
        course_id: null,
        lesson_id: null,
        access_type: "enrolled",
        success: true,
        details: { action: "view_enrolled_courses", courses_count: coursesData.length },
      })
    }

    console.log(`📚 Found ${coursesData.length} courses for user`)

    return NextResponse.json({
      success: true,
      courses: coursesData,
      user_role: isAdmin ? "admin" : "student",
      access_type: isAdmin ? "admin" : "enrolled",
    })
  } catch (error) {
    console.error("❌ STUDENT COURSES ERROR:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
