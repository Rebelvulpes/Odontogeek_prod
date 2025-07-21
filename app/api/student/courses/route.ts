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

    // Get all published courses with their lessons
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        instructor,
        difficulty_level,
        thumbnail_url,
        created_at,
        lessons (
          id,
          title,
          description,
          duration_minutes,
          order_index,
          is_free
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
      .select("course_id, status, progress, enrolled_at")
      .eq("user_id", userSession.id)
      .eq("status", "active")

    debugInfo.enrollmentsQuery = {
      error: enrollmentsError?.message || null,
      found: !!enrollments,
      count: enrollments?.length || 0,
    }

    const enrollmentMap = new Map()
    if (enrollments) {
      enrollments.forEach((enrollment) => {
        enrollmentMap.set(enrollment.course_id, enrollment)
      })
    }

    debugInfo.step = "processing_courses"

    // Process courses with enrollment and access information
    const processedCourses =
      courses?.map((course) => {
        const enrollment = enrollmentMap.get(course.id)
        const isEnrolled = !!enrollment

        // Sort lessons by order_index
        const sortedLessons = course.lessons?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []

        // Calculate access information for each lesson
        const lessonsWithAccess = sortedLessons.map((lesson) => ({
          ...lesson,
          hasAccess: userSession.role === "admin" || lesson.is_free || isEnrolled,
          accessType:
            userSession.role === "admin" ? "admin" : lesson.is_free ? "free" : isEnrolled ? "enrolled" : "premium",
        }))

        // Calculate course statistics
        const totalLessons = lessonsWithAccess.length
        const freeLessons = lessonsWithAccess.filter((l) => l.is_free).length
        const accessibleLessons = lessonsWithAccess.filter((l) => l.hasAccess).length
        const totalDuration = lessonsWithAccess.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0)

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          instructor: course.instructor,
          difficulty_level: course.difficulty_level,
          thumbnail_url: course.thumbnail_url,
          created_at: course.created_at,
          enrollment: enrollment
            ? {
                status: enrollment.status,
                progress: enrollment.progress,
                enrolled_at: enrollment.enrolled_at,
              }
            : null,
          access: {
            isEnrolled,
            canEnroll: !isEnrolled,
            hasFullAccess: userSession.role === "admin" || isEnrolled,
          },
          stats: {
            totalLessons,
            freeLessons,
            premiumLessons: totalLessons - freeLessons,
            accessibleLessons,
            totalDuration,
            estimatedHours: Math.ceil(totalDuration / 60),
          },
          lessons: lessonsWithAccess,
        }
      }) || []

    debugInfo.step = "success"
    debugInfo.success = true
    debugInfo.processingTime = Date.now() - startTime
    debugInfo.coursesProcessed = processedCourses.length

    // Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "courses_access",
      true,
      null,
      `Successfully fetched ${processedCourses.length} courses`,
      ipAddress,
      userAgent,
    )

    return NextResponse.json({
      success: true,
      courses: processedCourses,
      user: {
        id: userSession.id,
        email: userSession.email,
        role: userSession.role,
      },
      summary: {
        totalCourses: processedCourses.length,
        enrolledCourses: processedCourses.filter((c) => c.access.isEnrolled).length,
        availableCourses: processedCourses.filter((c) => !c.access.isEnrolled).length,
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
