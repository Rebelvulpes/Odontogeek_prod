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
        "courses_access",
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

    debugInfo.step = "courses_lookup"

    // Get all courses with their lessons
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        thumbnail_url,
        difficulty_level,
        status,
        created_at,
        lessons (
          id,
          title,
          description,
          duration_minutes,
          order_index,
          is_free,
          created_at
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })

    debugInfo.coursesQuery = {
      error: coursesError?.message || null,
      found: !!courses,
      count: courses?.length || 0,
    }

    if (coursesError) {
      debugInfo.error = `Error fetching courses: ${coursesError.message}`
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "courses_access",
        false,
        "DATABASE_ERROR",
        `Error fetching courses: ${coursesError.message}`,
        ipAddress,
        userAgent,
      )

      return NextResponse.json(
        {
          error: "Error fetching courses",
          debug: debugInfo,
        },
        { status: 500 },
      )
    }

    debugInfo.step = "enrollment_check"

    // Get user's enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id, status, created_at")
      .eq("user_id", userSession.id)
      .eq("status", "active")

    debugInfo.enrollmentsQuery = {
      error: enrollmentsError?.message || null,
      found: !!enrollments,
      count: enrollments?.length || 0,
    }

    const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || [])

    debugInfo.step = "data_processing"

    // Process courses data
    const processedCourses = courses?.map((course) => {
      const isEnrolled = enrolledCourseIds.has(course.id)
      const sortedLessons = course.lessons?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []
      const freeLessons = sortedLessons.filter((lesson) => lesson.is_free)
      const premiumLessons = sortedLessons.filter((lesson) => !lesson.is_free)

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail_url: course.thumbnail_url,
        difficulty_level: course.difficulty_level,
        created_at: course.created_at,
        lessons: {
          total: sortedLessons.length,
          free: freeLessons.length,
          premium: premiumLessons.length,
          list: sortedLessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            duration_minutes: lesson.duration_minutes,
            order_index: lesson.order_index,
            is_free: lesson.is_free,
            has_access: userSession.role === "admin" || lesson.is_free || isEnrolled,
          })),
        },
        enrollment: {
          is_enrolled: isEnrolled,
          can_access_premium: userSession.role === "admin" || isEnrolled,
        },
      }
    })

    debugInfo.step = "success"
    debugInfo.success = true
    debugInfo.processingTime = Date.now() - startTime
    debugInfo.coursesProcessed = processedCourses?.length || 0

    // Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "courses_access",
      true,
      null,
      `Successfully fetched ${processedCourses?.length || 0} courses`,
      ipAddress,
      userAgent,
    )

    // Return courses data
    return NextResponse.json({
      success: true,
      courses: processedCourses || [],
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

    console.error("❌ Error in courses access API:", error)

    // Log the error
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logStudentAccess(
        null,
        "unknown",
        "courses_access",
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
