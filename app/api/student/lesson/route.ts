import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    if (!lessonId || !courseId) {
      return NextResponse.json({ error: "Lesson ID y Course ID son requeridos" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: "Error al obtener perfil de usuario" }, { status: 500 })
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        *,
        courses (
          id,
          title,
          price
        )
      `)
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (lessonError || !lesson) {
      console.error("Error fetching lesson:", lessonError)
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 })
    }

    let hasAccess = false
    let accessType = "denied"

    // Check access permissions
    if (profile.role === "admin") {
      // Admins have access to everything
      hasAccess = true
      accessType = "admin"
    } else if (lesson.is_free) {
      // Free lessons are accessible to all logged-in users
      hasAccess = true
      accessType = "free"
    } else {
      // Check if user is enrolled in the course
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("status")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single()

      if (!enrollmentError && enrollment) {
        hasAccess = true
        accessType = "enrolled"
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "No tienes acceso a esta lección",
          requiresEnrollment: !lesson.is_free,
          isFreeLessonRequiresLogin: lesson.is_free,
        },
        { status: 403 },
      )
    }

    // Log access for monitoring
    await supabase.from("student_access_logs").insert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      access_type: accessType,
      accessed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      lesson,
      hasAccess: true,
      accessType,
    })
  } catch (error) {
    console.error("Error in student lesson API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
