import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT COURSES REQUEST ===")

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    console.log("✅ User session found:", userSession.email)

    const supabase = getServerSupabaseClient()

    // Get courses with lessons and enrollment status
    console.log("=== FETCHING COURSES WITH LESSONS ===")
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        instructor,
        price,
        thumbnail_url,
        difficulty_level,
        status,
        created_at,
        lessons (
          id,
          title,
          description,
          order_index,
          is_free,
          duration_minutes
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("❌ Error fetching courses:", coursesError)
      return NextResponse.json(
        {
          success: false,
          message: "Error al cargar los cursos",
        },
        { status: 500 },
      )
    }

    console.log("✅ Found", courses?.length || 0, "courses")

    // Get user's enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id, status, progress, enrolled_at")
      .eq("user_id", userSession.id)
      .eq("status", "active")

    if (enrollmentsError) {
      console.log("⚠️ Error fetching enrollments:", enrollmentsError)
    }

    console.log("✅ Found", enrollments?.length || 0, "enrollments")

    // Process courses with enrollment status and lesson counts
    const processedCourses =
      courses?.map((course) => {
        const enrollment = enrollments?.find((e) => e.course_id === course.id)
        const lessons = course.lessons || []

        // Sort lessons by order_index
        lessons.sort((a, b) => a.order_index - b.order_index)

        const totalLessons = lessons.length
        const freeLessons = lessons.filter((l) => l.is_free).length
        const premiumLessons = totalLessons - freeLessons

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          thumbnail_url: course.thumbnail_url,
          difficulty_level: course.difficulty_level,
          status: course.status,
          created_at: course.created_at,
          lessons: lessons,
          enrollment: enrollment
            ? {
                status: enrollment.status,
                progress: enrollment.progress,
                enrolled_at: enrollment.enrolled_at,
              }
            : null,
          lesson_counts: {
            total: totalLessons,
            free: freeLessons,
            premium: premiumLessons,
          },
          access_info: {
            is_enrolled: !!enrollment,
            can_access_free: true, // All logged-in users can access free lessons
            can_access_premium: !!enrollment || userSession.role === "admin",
            is_admin: userSession.role === "admin",
          },
        }
      }) || []

    // Log the request
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "courses_list_viewed",
      true,
      null,
      `Viewed courses list - ${processedCourses.length} courses available`,
      req.headers.get("x-forwarded-for") || "unknown",
      req.headers.get("user-agent") || "unknown",
    )

    console.log("✅ COURSES REQUEST COMPLETED")
    console.log("Courses returned:", processedCourses.length)
    console.log("User enrollments:", enrollments?.length || 0)

    return NextResponse.json({
      success: true,
      courses: processedCourses,
      user_info: {
        id: userSession.id,
        email: userSession.email,
        role: userSession.role,
        total_enrollments: enrollments?.length || 0,
      },
    })
  } catch (error) {
    console.error("❌ STUDENT COURSES ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
