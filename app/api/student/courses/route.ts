import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient, logStudentAccess } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    // Get request info for logging
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Connect to database
    const supabase = getServerSupabaseClient()

    // Get courses with lessons and enrollment status
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        instructor,
        thumbnail_url,
        difficulty_level,
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
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error fetching courses:", coursesError)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "courses_access",
        false,
        "DATABASE_ERROR",
        coursesError.message,
        ipAddress,
        userAgent,
      )
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }

    // Get user's enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id, status, created_at")
      .eq("user_id", userSession.id)

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError)
    }

    // Create enrollment map for quick lookup
    const enrollmentMap = new Map()
    if (enrollments) {
      enrollments.forEach((enrollment) => {
        enrollmentMap.set(enrollment.course_id, enrollment)
      })
    }

    // Enhance courses with enrollment status and access info
    const enhancedCourses =
      courses?.map((course) => {
        const enrollment = enrollmentMap.get(course.id)
        const isEnrolled = !!enrollment && enrollment.status === "active"
        const isAdmin = userSession.role === "admin"

        // Sort lessons by order_index
        const sortedLessons = course.lessons?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []

        // Calculate accessible lessons
        const accessibleLessons = sortedLessons.filter((lesson) => lesson.is_free || isEnrolled || isAdmin)

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          instructor: course.instructor,
          thumbnail_url: course.thumbnail_url,
          difficulty_level: course.difficulty_level,
          created_at: course.created_at,
          enrollment: {
            isEnrolled,
            status: enrollment?.status || null,
            enrolledAt: enrollment?.created_at || null,
          },
          lessons: {
            total: sortedLessons.length,
            accessible: accessibleLessons.length,
            free: sortedLessons.filter((l) => l.is_free).length,
            premium: sortedLessons.filter((l) => !l.is_free).length,
            list: sortedLessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              duration_minutes: lesson.duration_minutes,
              order_index: lesson.order_index,
              is_free: lesson.is_free,
              hasAccess: lesson.is_free || isEnrolled || isAdmin,
            })),
          },
          access: {
            canAccess: isAdmin || isEnrolled || sortedLessons.some((l) => l.is_free),
            reason: isAdmin ? "admin" : isEnrolled ? "enrolled" : "free_content",
          },
        }
      }) || []

    // Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "courses_access",
      true,
      null,
      `Successfully fetched ${enhancedCourses.length} courses`,
      ipAddress,
      userAgent,
    )

    return NextResponse.json({
      success: true,
      courses: enhancedCourses,
      user: {
        id: userSession.id,
        email: userSession.email,
        role: userSession.role,
        name: `${userSession.first_name || ""} ${userSession.last_name || ""}`.trim(),
      },
      stats: {
        totalCourses: enhancedCourses.length,
        enrolledCourses: enhancedCourses.filter((c) => c.enrollment.isEnrolled).length,
        freeCourses: enhancedCourses.filter((c) => c.lessons.free > 0).length,
      },
    })
  } catch (error) {
    console.error("❌ Error in courses API:", error)

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
        error instanceof Error ? error.message : "Unknown error",
        ipAddress,
        userAgent,
      )
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
