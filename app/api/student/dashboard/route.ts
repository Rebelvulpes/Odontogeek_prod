import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== DASHBOARD REQUEST START ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json(
        {
          success: false,
          message: "Sesión no válida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    console.log("✅ Valid session found for user:", userSession.email)

    const supabase = getServerSupabaseClient()

    // Get user's enrolled courses with error handling
    let enrolledCourses = []
    let enrolledCoursesError = null

    try {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrolled_at,
          progress,
          completed,
          course:courses (
            id,
            title,
            description,
            thumbnail_url,
            price,
            instructor,
            duration,
            level,
            created_at
          )
        `)
        .eq("user_id", userSession.id)
        .eq("active", true)

      if (enrollmentsError) {
        console.error("❌ Error fetching enrollments:", enrollmentsError)
        enrolledCoursesError = enrollmentsError
      } else {
        enrolledCourses = enrollments || []
        console.log(`✅ Found ${enrolledCourses.length} enrolled courses`)
      }
    } catch (error) {
      console.error("❌ Exception fetching enrollments:", error)
      enrolledCoursesError = error
    }

    // Get available courses (not enrolled) with error handling
    let availableCourses = []
    let availableCoursesError = null

    try {
      const enrolledCourseIds = enrolledCourses.map((enrollment: any) => enrollment.course?.id).filter(Boolean)

      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .not("id", "in", `(${enrolledCourseIds.length > 0 ? enrolledCourseIds.join(",") : "null"})`)
        .order("created_at", { ascending: false })
        .limit(6)

      if (coursesError) {
        console.error("❌ Error fetching available courses:", coursesError)
        availableCoursesError = coursesError
      } else {
        availableCourses = courses || []
        console.log(`✅ Found ${availableCourses.length} available courses`)
      }
    } catch (error) {
      console.error("❌ Exception fetching available courses:", error)
      availableCoursesError = error
    }

    // Calculate user statistics
    const stats = {
      totalCourses: enrolledCourses.length,
      completedCourses: enrolledCourses.filter((enrollment: any) => enrollment.completed).length,
      inProgressCourses: enrolledCourses.filter((enrollment: any) => !enrollment.completed && enrollment.progress > 0)
        .length,
      totalProgress:
        enrolledCourses.length > 0
          ? Math.round(
              enrolledCourses.reduce((sum: number, enrollment: any) => sum + (enrollment.progress || 0), 0) /
                enrolledCourses.length,
            )
          : 0,
    }

    // Log successful dashboard access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "dashboard_access",
      true,
      null,
      `Dashboard loaded with ${enrolledCourses.length} enrolled courses`,
      clientIP,
      userAgent,
    )

    const endTime = Date.now()
    console.log("✅ DASHBOARD SUCCESS")
    console.log("Total processing time:", endTime - startTime, "ms")

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userSession.id,
          email: userSession.email,
          first_name: userSession.first_name,
          last_name: userSession.last_name,
          role: userSession.role,
        },
        enrolledCourses,
        availableCourses,
        stats,
        errors: {
          enrolledCoursesError: enrolledCoursesError?.message || null,
          availableCoursesError: availableCoursesError?.message || null,
        },
      },
    })
  } catch (error) {
    const endTime = Date.now()
    console.error("=== DASHBOARD ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)

    await logStudentAccess(
      null,
      "unknown",
      "dashboard_error",
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
