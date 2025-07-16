import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT DASHBOARD ACCESS ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
    console.log("Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie.value)
      console.log("Session parsed successfully")
      console.log("Session user ID:", userSession.id)
      console.log("Session email:", userSession.email)
      console.log("Session role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    // Verify user is a student
    if (userSession.role !== "student") {
      console.log("❌ USER IS NOT A STUDENT")
      return NextResponse.json(
        {
          success: false,
          message: "Acceso no autorizado - solo estudiantes",
          error: "UNAUTHORIZED_ROLE",
        },
        { status: 403 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user still exists and get updated info
    console.log("=== VERIFYING USER IN DATABASE ===")
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userSession.id).single()

    console.log("User verification result:")
    console.log("- User found:", !!user)
    console.log("- Error:", userError)

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 401 },
      )
    }

    if (user.role !== "student") {
      console.log("❌ USER ROLE CHANGED - NOT A STUDENT")
      return NextResponse.json(
        {
          success: false,
          message: "Acceso no autorizado - rol de usuario inválido",
          error: "INVALID_USER_ROLE",
        },
        { status: 403 },
      )
    }

    // Get student's enrolled courses with progress
    console.log("=== FETCHING STUDENT COURSES ===")
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        status,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          duration_hours,
          level,
          instructor
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")

    console.log("Enrollments query result:")
    console.log("- Success:", !enrollmentsError)
    console.log("- Error:", enrollmentsError)
    console.log("- Enrollments found:", enrollments?.length || 0)

    if (enrollmentsError) {
      console.error("❌ ERROR FETCHING ENROLLMENTS:", enrollmentsError)
      return NextResponse.json(
        {
          success: false,
          message: "Error cargando cursos del estudiante",
          error: "ENROLLMENTS_FETCH_ERROR",
        },
        { status: 500 },
      )
    }

    // Transform enrollments data
    const courses = (enrollments || []).map((enrollment) => ({
      id: enrollment.courses.id,
      title: enrollment.courses.title,
      description: enrollment.courses.description,
      thumbnail_url: enrollment.courses.thumbnail_url,
      price: enrollment.courses.price,
      duration_hours: enrollment.courses.duration_hours,
      level: enrollment.courses.level,
      instructor: enrollment.courses.instructor,
      progress: enrollment.progress || 0,
      enrolled_at: enrollment.enrolled_at,
      completed_at: enrollment.completed_at,
      enrollment_id: enrollment.id,
    }))

    console.log("Transformed courses:", courses.length)

    // Get student statistics
    const totalCourses = courses.length
    const completedCourses = courses.filter((course) => course.completed_at).length
    const inProgressCourses = courses.filter((course) => !course.completed_at && course.progress > 0).length
    const totalHours = courses.reduce((sum, course) => sum + (course.duration_hours || 0), 0)
    const averageProgress =
      totalCourses > 0 ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses) : 0

    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      courses: courses,
      statistics: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalHours,
        averageProgress,
      },
    }

    console.log("=== DASHBOARD DATA PREPARED ===")
    console.log("User:", user.email)
    console.log("Courses:", courses.length)
    console.log("Statistics:", dashboardData.statistics)

    // Log successful dashboard access
    try {
      await supabase.from("student_access_log").insert([
        {
          student_id: user.id,
          email: user.email,
          action: "dashboard_access",
          success: true,
          error_message: "Dashboard accessed successfully",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          session_data: JSON.stringify(dashboardData.statistics),
        },
      ])
    } catch (logError) {
      console.error("Failed to log dashboard access:", logError)
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("=== DASHBOARD ACCESS ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Log error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from("student_access_log").insert([
        {
          email: "unknown",
          action: "dashboard_access",
          success: false,
          error_code: "INTERNAL_SERVER_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log dashboard error:", logError)
    }

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
