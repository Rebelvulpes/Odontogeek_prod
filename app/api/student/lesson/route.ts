import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getUserFromSession } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    // Debug info object
    const debugInfo = {
      timestamp,
      step: "initialization",
      lessonId,
      requestUrl: request.url,
      hasSession: false,
      userEmail: null,
      userRole: null,
      lessonQuery: {
        error: null,
        found: false,
        lessonTitle: null,
        courseTitle: null,
        isFree: false,
      },
      enrollmentCheck: {
        isEnrolled: false,
        error: null,
      },
      accessDecision: {
        hasAccess: false,
        reason: null,
      },
    }

    // Validate lesson ID
    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: "Lesson ID is required",
          debug: { ...debugInfo, step: "validation_failed" },
        },
        { status: 400 },
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(lessonId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid lesson ID format",
          debug: { ...debugInfo, step: "uuid_validation_failed" },
        },
        { status: 400 },
      )
    }

    debugInfo.step = "session_check"

    // Get user session
    const supabase = createClient()
    const user = await getUserFromSession()

    debugInfo.hasSession = !!user
    debugInfo.userEmail = user?.email || null
    debugInfo.userRole = user?.role || null

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
        course:courses (
          id,
          title,
          description,
          price,
          instructor
        )
      `)
      .eq("id", lessonId)
      .single()

    debugInfo.lessonQuery = {
      error: lessonError?.message || null,
      found: !!lesson,
      lessonTitle: lesson?.title || null,
      courseTitle: lesson?.course?.title || null,
      isFree: lesson?.is_free || false,
    }

    if (lessonError || !lesson) {
      return NextResponse.json(
        {
          success: false,
          error: `Lesson not found: ${lessonError?.message || "Unknown error"}`,
          debug: debugInfo,
        },
        { status: 404 },
      )
    }

    debugInfo.step = "access_check"

    // Determine access
    let hasAccess = false
    let accessReason = "no_access"

    // Admin always has access
    if (user?.role === "admin") {
      hasAccess = true
      accessReason = "admin_access"
    }
    // Free lessons are accessible to everyone
    else if (lesson.is_free) {
      hasAccess = true
      accessReason = "free_lesson"
    }
    // Check enrollment for premium lessons
    else if (user) {
      debugInfo.step = "enrollment_check"

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, user_id, course_id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course.id)
        .single()

      debugInfo.enrollmentCheck = {
        isEnrolled: !!enrollment,
        error: enrollmentError?.message || null,
      }

      if (enrollment) {
        hasAccess = true
        accessReason = "enrolled_user"
      } else {
        hasAccess = false
        accessReason = "not_enrolled"
      }
    } else {
      hasAccess = false
      accessReason = "not_authenticated"
    }

    debugInfo.accessDecision = {
      hasAccess,
      reason: accessReason,
    }

    debugInfo.step = "response_preparation"

    const response = {
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        video_url: lesson.video_url || "",
        duration_minutes: lesson.duration_minutes || 0,
        order_index: lesson.order_index || 1,
        is_free: lesson.is_free || false,
        created_at: lesson.created_at,
        course: {
          id: lesson.course.id,
          title: lesson.course.title,
          description: lesson.course.description || "",
          price: lesson.course.price || 0,
          instructor: lesson.course.instructor || "Instructor",
        },
      },
      access: {
        hasAccess,
        reason: accessReason,
        userRole: user?.role || "guest",
      },
      debug: {
        ...debugInfo,
        processingTime: `${Date.now() - startTime}ms`,
        step: "completed",
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Lesson API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        debug: {
          timestamp,
          step: "error_handler",
          error: error instanceof Error ? error.message : "Unknown error",
          processingTime: `${Date.now() - startTime}ms`,
        },
      },
      { status: 500 },
    )
  }
}
