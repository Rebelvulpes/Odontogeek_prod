import { type NextRequest, NextResponse } from "next/server"
import { logStudentAccess, getServerSupabaseClient, getUserSessionFromCookie } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  const cookieHeader = req.headers.get("cookie")

  try {
    console.log("=== DASHBOARD API REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())
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
          message: "Sesión no válida",
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
      .select("id, email, first_name, last_name, role")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "dashboard_access",
        false,
        "USER_NOT_FOUND",
        "User not found in database",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    // Get user's enrolled courses with progress
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

    if (enrollmentsError) {
      console.error("❌ ERROR FETCHING ENROLLMENTS:", enrollmentsError)
      await logStudentAccess(
        user.id,
        user.email,
        "dashboard_access",
        false,
        "ENROLLMENTS_FETCH_ERROR",
        enrollmentsError.message,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener cursos",
          error: "ENROLLMENTS_FETCH_ERROR",
        },
        { status: 500 },
      )
    }

    // Calculate statistics
    const totalCourses = enrollments?.length || 0
    const completedCourses = enrollments?.filter((e) => e.completed_at)?.length || 0
    const inProgressCourses = enrollments?.filter((e) => !e.completed_at && e.progress > 0)?.length || 0
    const totalLessons = enrollments?.reduce((acc, e) => acc + (e.courses?.lessons?.length || 0), 0) || 0

    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessons,
      },
      enrollments: enrollments || [],
    }

    // Log successful dashboard access
    await logStudentAccess(
      user.id,
      user.email,
      "dashboard_access",
      true,
      null,
      "Dashboard data retrieved successfully",
      clientIP,
      userAgent,
    )

    console.log("✅ DASHBOARD DATA RETRIEVED SUCCESSFULLY")
    console.log("Total courses:", totalCourses)
    console.log("Completed courses:", completedCourses)

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("=== DASHBOARD API ERROR ===")
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
