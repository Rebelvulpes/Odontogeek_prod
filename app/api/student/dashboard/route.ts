import { type NextRequest, NextResponse } from "next/server"
import { logStudentAccess, getServerSupabaseClient, getUserSessionFromCookie } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  const cookieHeader = req.headers.get("cookie")

  try {
    console.log("=== DASHBOARD API REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", req.headers.get("host"))
    console.log("Session cookie exists:", !!cookieHeader)

    // Get user session from cookie
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ NO SESSION COOKIE FOUND")
      await logStudentAccess(
        null,
        "unknown",
        "dashboard_access",
        false,
        "NO_SESSION",
        "No session cookie found",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Sesión no válida. Por favor, inicia sesión nuevamente.",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    console.log("✅ SESSION FOUND:", userSession.email)

    const supabase = getServerSupabaseClient()

    // Verify user still exists and is active
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE:", userError?.message)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "dashboard_access",
        false,
        "USER_NOT_FOUND",
        userError?.message || "User not found in database",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado. Por favor, contacta al soporte.",
          error: "USER_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    console.log("✅ USER VERIFIED:", user.email, "Role:", user.role)

    // Get user's enrolled courses with progress - handle empty results gracefully
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          instructor,
          duration_hours,
          lessons (
            id,
            title,
            duration_minutes
          )
        )
      `)
      .eq("user_id", user.id)

    // Handle enrollments error but don't fail completely
    if (enrollmentsError) {
      console.error("⚠️ ERROR FETCHING ENROLLMENTS (non-fatal):", enrollmentsError)
      // Log the error but continue with empty enrollments
      await logStudentAccess(
        user.id,
        user.email,
        "dashboard_access",
        true,
        "ENROLLMENTS_FETCH_WARNING",
        `Enrollments fetch failed: ${enrollmentsError.message}`,
        clientIP,
        userAgent,
      )
    }

    // Safely handle enrollments - default to empty array if null or error
    const safeEnrollments = enrollments || []
    console.log("📚 ENROLLMENTS FOUND:", safeEnrollments.length)

    // Filter out enrollments with null courses (data integrity issue)
    const validEnrollments = safeEnrollments.filter(
      (enrollment) => enrollment.courses && enrollment.courses.id && enrollment.courses.title,
    )

    if (validEnrollments.length !== safeEnrollments.length) {
      console.log("⚠️ FILTERED OUT INVALID ENROLLMENTS:", safeEnrollments.length - validEnrollments.length)
    }

    // Calculate statistics safely
    const totalCourses = validEnrollments.length
    const completedCourses = validEnrollments.filter((e) => e.completed_at).length
    const inProgressCourses = validEnrollments.filter((e) => !e.completed_at && e.progress > 0).length
    const notStartedCourses = validEnrollments.filter((e) => !e.completed_at && e.progress === 0).length
    const totalLessons = validEnrollments.reduce((acc, e) => acc + (e.courses?.lessons?.length || 0), 0)

    // Calculate average progress
    const averageProgress =
      totalCourses > 0 ? Math.round(validEnrollments.reduce((acc, e) => acc + e.progress, 0) / totalCourses) : 0

    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        member_since: user.created_at,
      },
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        totalLessons,
        averageProgress,
      },
      enrollments: validEnrollments,
      hasEnrollments: validEnrollments.length > 0,
    }

    // Log successful dashboard access
    await logStudentAccess(
      user.id,
      user.email,
      "dashboard_access",
      true,
      null,
      `Dashboard loaded successfully. Courses: ${totalCourses}, Completed: ${completedCourses}`,
      clientIP,
      userAgent,
    )

    console.log("✅ DASHBOARD DATA PREPARED SUCCESSFULLY")
    console.log("Stats:", {
      totalCourses,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      totalLessons,
      averageProgress,
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("=== DASHBOARD API ERROR ===")
    console.error("Error details:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack")

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
        message: "Error interno del servidor. Por favor, intenta nuevamente.",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
