import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestUrl = request.url
  const userAgent = request.headers.get("user-agent") || "unknown"
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  console.log(`🔍 [LESSON ACCESS] Starting lesson access request`)
  console.log(`📍 Request URL: ${requestUrl}`)

  try {
    // 1. Extract lesson ID from URL
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    const debugInfo = {
      timestamp: new Date().toISOString(),
      step: "initial_validation",
      lessonId,
      requestUrl,
    }

    if (!lessonId) {
      console.log("❌ No lesson ID provided")
      return NextResponse.json(
        {
          ...debugInfo,
          step: "validation_failed",
          success: false,
          error: "Lesson ID is required",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(lessonId)) {
      console.log(`❌ Invalid UUID format: ${lessonId}`)
      return NextResponse.json(
        {
          ...debugInfo,
          step: "uuid_validation_failed",
          success: false,
          error: "Invalid lesson ID format",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log(`✅ Valid lesson ID: ${lessonId}`)

    // 2. Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    const sessionDebug = {
      ...debugInfo,
      step: "session_validation",
      hasSession: !!userSession,
      userEmail: userSession?.email || null,
      userRole: userSession?.role || null,
    }

    if (!userSession) {
      console.log("❌ No valid user session found")
      try {
        await logStudentAccess(
          null,
          "anonymous",
          "lesson_access_denied",
          false,
          "NO_SESSION",
          "No valid session",
          ipAddress,
          userAgent,
        )
      } catch (logError) {
        console.error("❌ Error logging access:", logError)
      }

      return NextResponse.json(
        {
          ...sessionDebug,
          success: false,
          error: "Authentication required",
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log(`✅ User session found: ${userSession.email} (${userSession.role})`)

    // 3. Get Supabase client with error handling
    let supabase
    try {
      supabase = getServerSupabaseClient()
    } catch (supabaseError) {
      console.error("❌ Error creating Supabase client:", supabaseError)
      return NextResponse.json(
        {
          ...sessionDebug,
          step: "supabase_client_error",
          success: false,
          error: "Database connection error",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 4. Look up lesson with detailed error handling
    console.log(`🔍 Looking up lesson: ${lessonId}`)

    let lessonQuery
    try {
      lessonQuery = await supabase
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
          status,
          course_id,
          courses!inner (
            id,
            title,
            status,
            is_free
          )
        `)
        .eq("id", lessonId)
        .eq("status", "published")
        .single()
    } catch (queryError) {
      console.error("❌ Database query error:", queryError)
      return NextResponse.json(
        {
          ...sessionDebug,
          step: "database_query_error",
          success: false,
          error: "Database query failed",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const lessonDebug = {
      ...sessionDebug,
      step: "lesson_lookup",
      lessonQuery: {
        error: lessonQuery.error?.message || null,
        found: !!lessonQuery.data,
        lessonTitle: lessonQuery.data?.title || null,
        courseTitle: lessonQuery.data?.courses?.title || null,
        isFree: lessonQuery.data?.is_free || false,
      },
    }

    if (lessonQuery.error) {
      console.log(`❌ Database error looking up lesson:`, lessonQuery.error)
      try {
        await logStudentAccess(
          userSession.id,
          userSession.email,
          "lesson_access_error",
          false,
          "DB_ERROR",
          lessonQuery.error.message,
          ipAddress,
          userAgent,
        )
      } catch (logError) {
        console.error("❌ Error logging access:", logError)
      }

      return NextResponse.json(
        {
          ...lessonDebug,
          success: false,
          error: `Lesson not found: ${lessonQuery.error.message}`,
        },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!lessonQuery.data) {
      console.log(`❌ Lesson not found: ${lessonId}`)
      try {
        await logStudentAccess(
          userSession.id,
          userSession.email,
          "lesson_not_found",
          false,
          "NOT_FOUND",
          `Lesson ${lessonId} not found`,
          ipAddress,
          userAgent,
        )
      } catch (logError) {
        console.error("❌ Error logging access:", logError)
      }

      return NextResponse.json(
        {
          ...lessonDebug,
          success: false,
          error: "Lesson not found",
        },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const lesson = lessonQuery.data
    console.log(`✅ Lesson found: "${lesson.title}" in course "${lesson.courses.title}"`)

    // 5. Check access permissions
    let hasAccess = false
    let accessReason = ""

    // Admin always has access
    if (userSession.role === "admin") {
      hasAccess = true
      accessReason = "admin_access"
      console.log(`✅ Admin access granted`)
    }
    // Free lessons are accessible to everyone
    else if (lesson.is_free) {
      hasAccess = true
      accessReason = "free_lesson"
      console.log(`✅ Free lesson access granted`)
    }
    // Check enrollment for paid lessons
    else {
      console.log(`🔍 Checking enrollment for paid lesson`)
      try {
        const enrollmentQuery = await supabase
          .from("enrollments")
          .select("id, status")
          .eq("user_id", userSession.id)
          .eq("course_id", lesson.course_id)
          .eq("status", "active")
          .single()

        if (enrollmentQuery.data) {
          hasAccess = true
          accessReason = "enrolled"
          console.log(`✅ Enrollment found - access granted`)
        } else {
          hasAccess = false
          accessReason = "not_enrolled"
          console.log(`❌ No active enrollment found`)
        }
      } catch (enrollmentError) {
        console.error("❌ Error checking enrollment:", enrollmentError)
        hasAccess = false
        accessReason = "enrollment_check_failed"
      }
    }

    const accessDebug = {
      ...lessonDebug,
      step: "access_check",
      hasAccess,
      accessReason,
      isAdmin: userSession.role === "admin",
      isFreeLesson: lesson.is_free,
    }

    if (!hasAccess) {
      console.log(`❌ Access denied for lesson: ${lessonId}`)
      try {
        await logStudentAccess(
          userSession.id,
          userSession.email,
          "lesson_access_denied",
          false,
          "NO_ACCESS",
          `Access denied to lesson ${lessonId} - ${accessReason}`,
          ipAddress,
          userAgent,
        )
      } catch (logError) {
        console.error("❌ Error logging access:", logError)
      }

      return NextResponse.json(
        {
          ...accessDebug,
          success: false,
          error: "Access denied - enrollment required",
        },
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 6. Log successful access
    try {
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_granted",
        true,
        null,
        `Access granted to lesson ${lessonId} - ${accessReason}`,
        ipAddress,
        userAgent,
      )
    } catch (logError) {
      console.error("❌ Error logging access:", logError)
    }

    // 7. Return lesson data
    const responseTime = Date.now() - startTime
    console.log(`✅ Lesson access granted in ${responseTime}ms`)

    const successResponse = {
      ...accessDebug,
      step: "success",
      success: true,
      responseTime: `${responseTime}ms`,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        video_url: lesson.video_url,
        duration_minutes: lesson.duration_minutes,
        order_index: lesson.order_index,
        is_free: lesson.is_free,
        course: {
          id: lesson.courses.id,
          title: lesson.courses.title,
        },
      },
    }

    return NextResponse.json(successResponse, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Unexpected error in lesson access:`, error)

    // Try to get user info for logging
    let userSession = null
    try {
      const cookieHeader = request.headers.get("cookie")
      userSession = getUserSessionFromCookie(cookieHeader)
    } catch (sessionError) {
      console.error("❌ Error getting session for logging:", sessionError)
    }

    try {
      await logStudentAccess(
        userSession?.id || null,
        userSession?.email || "unknown",
        "lesson_access_error",
        false,
        "UNEXPECTED_ERROR",
        error instanceof Error ? error.message : "Unknown error",
        ipAddress,
        userAgent,
      )
    } catch (logError) {
      console.error("❌ Error logging access:", logError)
    }

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        step: "unexpected_error",
        success: false,
        error: "Internal server error",
        responseTime: `${responseTime}ms`,
        requestUrl,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
