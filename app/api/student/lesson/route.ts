import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient, logStudentAccess } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: "initialization",
    success: false,
  }

  try {
    // Get request info for logging
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Get lesson ID from URL parameters
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    debugInfo.lessonId = lessonId
    debugInfo.requestUrl = request.url

    if (!lessonId) {
      debugInfo.error = "Missing lessonId parameter"
      return NextResponse.json(
        {
          error: "Missing lessonId parameter",
          debug: debugInfo,
        },
        { status: 400 },
      )
    }

    debugInfo.step = "authentication"

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    debugInfo.hasSession = !!userSession
    debugInfo.userEmail = userSession?.email || "none"
    debugInfo.userRole = userSession?.role || "none"

    if (!userSession) {
      debugInfo.error = "No valid session found"
      await logStudentAccess(
        null,
        "unknown",
        "lesson_access",
        false,
        "NO_SESSION",
        `Attempted to access lesson ${lessonId} without session`,
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Authentication required",
          debug: debugInfo,
        },
        { status: 401 },
      )
    }

    debugInfo.step = "database_connection"

    // Connect to database
    const supabase = getServerSupabaseClient()

    debugInfo.step = "lesson_lookup"

    // Get lesson with course information
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
        is_free,
        created_at,
        course_id,
        courses (
          id,
          title,
          description,
          price,
          instructor,
          difficulty_level
        )
      `)
      .eq("id", lessonId)
      .single()

    debugInfo.lessonQuery = {
      error: lessonError?.message || null,
      found: !!lesson,
      lessonTitle: lesson?.title || null,
      courseTitle: lesson?.courses?.title || null,
      isFree: lesson?.is_free || false,
    }

    if (lessonError || !lesson) {
      debugInfo.error = `Lesson not found: ${lessonError?.message || "No lesson data"}`
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access",
        false,
        "LESSON_NOT_FOUND",
        `Lesson ${lessonId} not found: ${lessonError?.message}`,
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Lesson not found",
          debug: debugInfo,
        },
        { status: 404 },
      )
    }

    debugInfo.step = "access_verification"

    // Check if user has access to this lesson
    let hasAccess = false
    let accessReason = ""

    // Admin users have full access
    if (userSession.role === "admin") {
      hasAccess = true
      accessReason = "admin_access"
    }
    // Free lessons are accessible to everyone
    else if (lesson.is_free) {
      hasAccess = true
      accessReason = "free_lesson"
    }
    // Check enrollment for premium lessons
    else {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status, progress")
        .eq("user_id", userSession.id)
        .eq("course_id", lesson.course_id)
        .eq("status", "active")
        .single()

      debugInfo.enrollmentQuery = {
        error: enrollmentError?.message || null,
        found: !!enrollment,
        status: enrollment?.status || null,
      }

      if (enrollment) {
        hasAccess = true
        accessReason = "enrolled"
      } else {
        hasAccess = false
        accessReason = "not_enrolled"
      }
    }

    debugInfo.accessCheck = {
      hasAccess,
      accessReason,
      userRole: userSession.role,
      lessonIsFree: lesson.is_free,
    }

    if (!hasAccess) {
      debugInfo.error = `Access denied: ${accessReason}`
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access",
        false,
        "ACCESS_DENIED",
        `Access denied to lesson ${lessonId}: ${accessReason}`,
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Access denied",
          message: "You need to enroll in this course to access this lesson",
          requiresEnrollment: !lesson.is_free,
          courseId: lesson.course_id,
          debug: debugInfo,
        },
        { status: 403 },
      )
    }

    debugInfo.step = "success"
    debugInfo.success = true
    debugInfo.processingTime = Date.now() - startTime

    // Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "lesson_access",
      true,
      null,
      `Successfully accessed lesson: ${lesson.title}`,
      ipAddress,
      userAgent,
    )

    // Return lesson data
    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content || "<p>Contenido de la lección en desarrollo...</p>",
        video_url: lesson.video_url,
        duration_minutes: lesson.duration_minutes,
        order_index: lesson.order_index,
        is_free: lesson.is_free,
        created_at: lesson.created_at,
        course: {
          id: lesson.courses.id,
          title: lesson.courses.title,
          description: lesson.courses.description,
          price: lesson.courses.price,
          instructor: lesson.courses.instructor,
          difficulty_level: lesson.courses.difficulty_level,
        },
      },
      access: {
        hasAccess: true,
        accessReason,
        userRole: userSession.role,
      },
      user: {
        id: userSession.id,
        email: userSession.email,
        role: userSession.role,
      },
      debug: debugInfo,
    })
  } catch (error) {
    debugInfo.step = "error_handling"
    debugInfo.error = error instanceof Error ? error.message : "Unknown error"
    debugInfo.processingTime = Date.now() - startTime

    console.error("❌ Error in lesson access API:", error)

    // Log the error
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logStudentAccess(
        null,
        "unknown",
        "lesson_access",
        false,
        "SERVER_ERROR",
        debugInfo.error,
        ipAddress,
        userAgent,
      )
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        debug: debugInfo,
      },
      { status: 500 },
    )
  }
}
