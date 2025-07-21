import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    // Connect to database
    const supabase = getServerSupabaseClient()

    // Get course with lessons
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(
          id,
          title,
          description,
          duration_minutes,
          order_index,
          is_free,
          video_url
        )
      `)
      .eq("id", courseId)
      .eq("status", "published")
      .single()

    if (courseError || !course) {
      console.error("Error fetching course:", courseError)
      return NextResponse.json({ success: false, message: "Curso no encontrado" }, { status: 404 })
    }

    // Check if user is enrolled
    let isEnrolled = false
    if (userSession) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userSession.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single()

      isEnrolled = !!enrollment
    }

    // Sort lessons by order_index
    if (course.lessons) {
      course.lessons.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    }

    return NextResponse.json({
      success: true,
      course,
      isEnrolled,
      user: userSession
        ? {
            id: userSession.id,
            email: userSession.email,
            role: userSession.role,
          }
        : null,
    })
  } catch (error) {
    console.error("Error in course API:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
