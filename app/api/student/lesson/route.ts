import { type NextRequest, NextResponse } from "next/server"
import { logStudentAccess, getServerSupabaseClient, getUserSessionFromCookie } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  const cookieHeader = req.headers.get("cookie")

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("courseId")
  const lessonId = searchParams.get("lessonId")

  try {
    console.log("=== LESSON API REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Course ID:", courseId)
    console.log("Lesson ID:", lessonId)

    if (!courseId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID y Lesson ID son requeridos",
          error: "MISSING_PARAMETERS",
        },
        { status: 400 },
      )
    }

    // Get user session from cookie
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ NO SESSION COOKIE FOUND")
      await logStudentAccess(
        null,
        "unknown",
        "lesson_access",
        false,
        "NO_SESSION",
        "No session cookie found",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Sesión no válida",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    console.log("✅ SESSION FOUND:", userSession.email)

    const supabase = getServerSupabaseClient()

    // Verify user is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id, progress")
      .eq("user_id", userSession.id)
      .eq("course_id", courseId)
      .single()

    if (enrollmentError || !enrollment) {
      console.log("❌ USER NOT ENROLLED IN COURSE")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access",
        false,
        "NOT_ENROLLED",
        `User not enrolled in course ${courseId}`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "No tienes acceso a este curso",
          error: "NOT_ENROLLED",
        },
        { status: 403 },
      )
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        description,
        content,
        video_url,
        duration_minutes,
        order_index,
        course_id,
        courses (
          id,
          title,
          description,
          instructor
        )
      `)
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (lessonError || !lesson) {
      console.log("❌ LESSON NOT FOUND")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access",
        false,
        "LESSON_NOT_FOUND",
        `Lesson ${lessonId} not found in course ${courseId}`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Lección no encontrada",
          error: "LESSON_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    // Get previous and next lessons
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id, title, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })

    const currentIndex = allLessons?.findIndex((l) => l.id === lessonId) || 0
    const previousLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
    const nextLesson = currentIndex < (allLessons?.length || 0) - 1 ? allLessons?.[currentIndex + 1] : null

    const lessonData = {
      lesson,
      enrollment,
      navigation: {
        previous: previousLesson,
        next: nextLesson,
        currentIndex: currentIndex + 1,
        totalLessons: allLessons?.length || 0,
      },
    }

    // Log successful lesson access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "lesson_access",
      true,
      null,
      `Accessed lesson ${lessonId} in course ${courseId}`,
      clientIP,
      userAgent,
    )

    console.log("✅ LESSON DATA RETRIEVED SUCCESSFULLY")
    console.log("Lesson title:", lesson.title)

    return NextResponse.json({
      success: true,
      data: lessonData,
    })
  } catch (error) {
    console.error("=== LESSON API ERROR ===")
    console.error("Error details:", error)

    await logStudentAccess(
      null,
      "unknown",
      "lesson_error",
      false,
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      clientIP,
      userAgent,
    )

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
