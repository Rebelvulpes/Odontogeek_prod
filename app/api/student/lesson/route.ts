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

    debugInfo.step = "parsing_parameters"

    // Get lesson ID from query parameters
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    debugInfo.lessonId = lessonId
    debugInfo.requestUrl = request.url

    if (!lessonId) {
      debugInfo.error = "Missing lessonId parameter"
      await logStudentAccess(
        null,
        "unknown",
        "lesson_access",
        false,
        "MISSING_LESSON_ID",
        "No lesson ID provided",
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Lesson ID is required",
          debug: debugInfo,
        },
        { status: 400 },
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(lessonId)) {
      debugInfo.error = "Invalid UUID format"
      await logStudentAccess(
        null,
        "unknown",
        "lesson_access",
        false,
        "INVALID_UUID",
        `Invalid lesson ID format: ${lessonId}`,
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Invalid lesson ID format",
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
        "No valid user session",
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

    // Get lesson with course information - Using only existing columns
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        content,
        description,
        duration_minutes,
        video_url,
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
          created_at
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

      // Get some debug info about available lessons
      const { data: availableLessons } = await supabase.from("lessons").select("id, title, course_id").limit(5)

      debugInfo.availableLessons = availableLessons

      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access",
        false,
        "LESSON_NOT_FOUND",
        `Lesson ${lessonId} not found: ${lessonError?.message || "No data"}`,
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

    debugInfo.step = "access_control"

    // Check if user has access to this lesson
    let hasAccess = false
    let accessReason = ""

    // Admin users have access to everything
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
      debugInfo.step = "enrollment_check"

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status, created_at")
        .eq("user_id", userSession.id)
        .eq("course_id", lesson.course_id)
        .single()

      debugInfo.enrollmentQuery = {
        error: enrollmentError?.message || null,
        found: !!enrollment,
        status: enrollment?.status || null,
      }

      if (enrollment && enrollment.status === "active") {
        hasAccess = true
        accessReason = "enrolled_access"
      } else {
        hasAccess = false
        accessReason = "no_enrollment"
      }
    }

    debugInfo.accessControl = {
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
          error: "Access denied. Enrollment required for premium content.",
          debug: debugInfo,
          requiresEnrollment: !lesson.is_free,
          lesson_info: {
            title: lesson.title,
            is_free: lesson.is_free,
            course_title: lesson.courses?.title,
          },
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
        content: lesson.content || "",
        description: lesson.description || "",
        duration_minutes: lesson.duration_minutes || 30,
        video_url: lesson.video_url || "",
        order_index: lesson.order_index || 1,
        is_free: lesson.is_free || false,
        created_at: lesson.created_at,
        course: {
          id: lesson.courses?.id,
          title: lesson.courses?.title,
          description: lesson.courses?.description,
          price: lesson.courses?.price,
          instructor: lesson.courses?.instructor,
        },
      },
      access: {
        hasAccess: true,
        reason: accessReason,
        userRole: userSession.role,
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
