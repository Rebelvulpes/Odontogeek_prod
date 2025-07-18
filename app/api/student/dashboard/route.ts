import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== DASHBOARD REQUEST START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Client IP:", clientIP)

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json({ success: false, message: "No hay sesión válida" }, { status: 401 })
    }

    console.log("✅ Valid session found for user:", userSession.email)

    const supabase = getServerSupabaseClient()

    // Get user enrollments with course details
    console.log("=== FETCHING USER ENROLLMENTS ===")
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrolled_at,
        progress,
        completed_at,
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
      .order("enrolled_at", { ascending: false })

    if (enrollmentsError) {
      console.error("❌ Error fetching enrollments:", enrollmentsError)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "dashboard_error",
        false,
        "ENROLLMENTS_FETCH_ERROR",
        enrollmentsError.message,
        clientIP,
        userAgent,
      )
    }

    console.log("Enrollments found:", enrollments?.length || 0)

    // Get recent activity (lessons accessed)
    console.log("=== FETCHING RECENT ACTIVITY ===")
    const { data: recentActivity, error: activityError } = await supabase
      .from("student_access_log")
      .select("*")
      .eq("student_id", userSession.id)
      .eq("action", "lesson_access")
      .order("created_at", { ascending: false })
      .limit(10)

    if (activityError) {
      console.error("❌ Error fetching recent activity:", activityError)
    }

    console.log("Recent activities found:", recentActivity?.length || 0)

    // Calculate dashboard statistics
    const stats = {
      totalCourses: enrollments?.length || 0,
      completedCourses: enrollments?.filter((e) => e.completed_at).length || 0,
      inProgressCourses: enrollments?.filter((e) => !e.completed_at && (e.progress || 0) > 0).length || 0,
      totalProgress:
        enrollments?.length > 0
          ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
          : 0,
    }

    console.log("Dashboard stats:", stats)

    // Prepare dashboard data
    const dashboardData = {
      user: {
        id: userSession.id,
        email: userSession.email,
        first_name: userSession.first_name,
        last_name: userSession.last_name,
        role: userSession.role,
      },
      stats,
      enrollments: enrollments || [],
      recentActivity: recentActivity || [],
      hasEnrollments: (enrollments?.length || 0) > 0,
    }

    // Log successful dashboard access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "dashboard_access",
      true,
      null,
      `Dashboard loaded with ${enrollments?.length || 0} enrollments`,
      clientIP,
      userAgent,
    )

    const endTime = Date.now()
    console.log("✅ DASHBOARD SUCCESS")
    console.log("Total processing time:", endTime - startTime, "ms")
    console.log("Enrollments returned:", enrollments?.length || 0)

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    const endTime = Date.now()
    console.error("=== DASHBOARD ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

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
