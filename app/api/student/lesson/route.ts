import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== LESSON ACCESS REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    console.log("Lesson ID:", lessonId)
    console.log("Course ID:", courseId)

    if (!lessonId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de lección y curso requeridos",
          error: "MISSING_PARAMETERS",
        },
        { status: 400 },
      )
    }

    // Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
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

    // Get lesson details
    console.log("=== FETCHING LESSON DETAILS ===")
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        description,
        video_url,
        duration_minutes,
        order_index,
        is_free,
        course_id,
        created_at,
        updated_at
      `)
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (lessonError || !lesson) {
      console.error("❌ LESSON NOT FOUND:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Lección no encontrada",
          error: "LESSON_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    console.log("Lesson found:", lesson.title)
    console.log("Is free lesson:", lesson.is_free)

    // Check access permissions
    let hasAccess = false
    let accessReason = ""

    // 1. Admin users have access to ALL lessons
    if (user.role === "admin") {
      hasAccess = true
      accessReason = "admin_access"
      console.log("✅ ADMIN ACCESS GRANTED")
    }
    // 2. Free lessons are accessible to ALL logged-in users
    else if (lesson.is_free) {
      hasAccess = true
      accessReason = "free_lesson"
      console.log("✅ FREE LESSON ACCESS GRANTED")
    }
    // 3. For paid lessons, check enrollment
    else {
      console.log("=== CHECKING ENROLLMENT FOR PAID LESSON ===")
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status, progress")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single()

      if (enrollment && !enrollmentError && enrollment.status === "active") {
        hasAccess = true
        accessReason = "enrolled"
        console.log("✅ ENROLLMENT ACCESS GRANTED")
      } else {
        hasAccess = false
        accessReason = "not_enrolled"
        console.log("❌ NO ENROLLMENT FOUND OR INACTIVE")
      }
    }

    if (!hasAccess) {
      console.log("❌ ACCESS DENIED")

      // Log access attempt
      try {
        await supabase.from("student_access_log").insert([
          {
            student_id: user.id,
            email: user.email,
            action: "lesson_access_denied",
            success: false,
            error_code: "ACCESS_DENIED",
            error_message: `Access denied to lesson ${lessonId} - reason: ${accessReason}`,
            ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
            session_data: JSON.stringify({ lessonId, courseId, accessReason }),
          },
        ])
      } catch (logError) {
        console.error("Failed to log access denial:", logError)
      }

      return NextResponse.json(
        {
          success: false,
          message: lesson.is_free
            ? "Esta lección requiere una cuenta activa"
            : "Esta lección requiere inscripción al curso",
          error: "ACCESS_DENIED",
          requiresEnrollment: !lesson.is_free,
        },
        { status: 403 },
      )
    }

    // Get course details for context
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, instructor")
      .eq("id", courseId)
      .single()

    // Prepare lesson data
    const lessonData = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url,
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      is_free: lesson.is_free,
      course_id: lesson.course_id,
      course_title: course?.title || "Curso",
      course_instructor: course?.instructor || "Instructor",
      access_reason: accessReason,
      user_role: user.role,
    }

    console.log("=== LESSON ACCESS GRANTED ===")
    console.log("User:", user.email)
    console.log("Lesson:", lesson.title)
    console.log("Access reason:", accessReason)

    // Log successful lesson access
    try {
      await supabase.from("student_access_log").insert([
        {
          student_id: user.id,
          email: user.email,
          action: "lesson_access",
          success: true,
          error_message: `Lesson accessed successfully - ${lesson.title} (${accessReason})`,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          session_data: JSON.stringify({
            lessonId,
            courseId,
            lessonTitle: lesson.title,
            accessReason,
            isFree: lesson.is_free,
          }),
        },
      ])
    } catch (logError) {
      console.error("Failed to log lesson access:", logError)
    }

    return NextResponse.json({
      success: true,
      lesson: lessonData,
      message: `Acceso concedido a la lección: ${lesson.title}`,
    })
  } catch (error) {
    console.error("=== LESSON ACCESS ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Log error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from("student_access_log").insert([
        {
          email: "unknown",
          action: "lesson_access",
          success: false,
          error_code: "INTERNAL_SERVER_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log lesson error:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
