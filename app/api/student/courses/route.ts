import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT COURSES ACCESS ===")
    console.log("Timestamp:", new Date().toISOString())

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user-session")
    console.log("Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie.value)
      console.log("Session parsed successfully")
      console.log("Session user ID:", userSession.id)
      console.log("Session email:", userSession.email)
      console.log("Session role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user still exists
    console.log("=== VERIFYING USER IN DATABASE ===")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 401 },
      )
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

    let coursesQuery

    // If user is admin, get all courses automatically
    if (profile.role === "admin") {
      coursesQuery = supabase
        .from("courses")
        .select(`
          *,
          course_tags (
            course_tag_definitions (
              name,
              color
            )
          ),
          lessons (
            id,
            title,
            is_free
          )
        `)
        .eq("archived", false)
        .order("created_at", { ascending: false })
    } else {
      // For regular users, get enrolled courses
      coursesQuery = supabase
        .from("courses")
        .select(`
          *,
          course_tags (
            course_tag_definitions (
              name,
              color
            )
          ),
          lessons (
            id,
            title,
            is_free
          ),
          enrollments!inner (
            enrolled_at,
            progress
          )
        `)
        .eq("archived", false)
        .eq("enrollments.user_id", user.id)
        .eq("enrollments.status", "active")
        .order("created_at", { ascending: false })
    }

    const { data: courses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error("Error fetching courses:", coursesError)
      return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
    }

    // Format courses data
    const formattedCourses =
      courses?.map((course) => ({
        ...course,
        tags: course.course_tags?.map((ct: any) => ct.course_tag_definitions) || [],
        lesson_count: course.lessons?.length || 0,
        free_lessons_count: course.lessons?.filter((l: any) => l.is_free).length || 0,
        progress: profile.role === "admin" ? 100 : course.enrollments?.[0]?.progress || 0,
        is_admin_access: profile.role === "admin",
      })) || []

    console.log("=== COURSES DATA PREPARED ===")
    console.log("User:", user.email)
    console.log("Total courses:", formattedCourses.length)

    // Log successful courses access
    try {
      await supabase.from("student_access_log").insert([
        {
          student_id: user.id,
          email: user.email,
          action: "courses_access",
          success: true,
          error_message: `Courses accessed successfully - ${formattedCourses.length} courses found`,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          session_data: JSON.stringify({ coursesCount: formattedCourses.length }),
        },
      ])
    } catch (logError) {
      console.error("Failed to log courses access:", logError)
    }

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
      message: formattedCourses.length > 0 ? "Cursos cargados exitosamente" : "No tienes cursos inscritos aún",
      isAdmin: profile.role === "admin",
    })
  } catch (error) {
    console.error("=== COURSES ACCESS ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Log error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from("student_access_log").insert([
        {
          email: "unknown",
          action: "courses_access",
          success: false,
          error_code: "INTERNAL_SERVER_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log courses error:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
        courses: [],
      },
      { status: 500 },
    )
  }
}
