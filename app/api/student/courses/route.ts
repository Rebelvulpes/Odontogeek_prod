import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT COURSES ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get user session
    const sessionCookie = req.cookies.get("user-session")
    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE")
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
      console.log("Session user ID:", userSession.id)
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

    // Verify user is student
    if (userSession.role !== "student") {
      console.log("❌ USER IS NOT STUDENT")
      return NextResponse.json(
        {
          success: false,
          message: "Acceso denegado",
          error: "ACCESS_DENIED",
        },
        { status: 403 },
      )
    }

    console.log("=== FETCHING COURSES ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get enrolled courses with progress
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        enrolled_at,
        completed_at,
        created_at,
        updated_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          duration_hours,
          level,
          instructor,
          status
        )
      `)
      .eq("user_id", userSession.id)

    console.log("Enrollments query result:")
    console.log("- Success:", !enrollmentError)
    console.log("- Error:", enrollmentError)
    console.log("- Count:", enrollments?.length || 0)

    if (enrollmentError) {
      console.error("❌ ENROLLMENTS QUERY ERROR:", enrollmentError)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo cursos",
          error: "QUERY_ERROR",
        },
        { status: 500 },
      )
    }

    // Transform data
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

    console.log("✅ COURSES FETCHED SUCCESSFULLY")
    console.log("Courses returned:", courses.length)

    return NextResponse.json({
      success: true,
      courses: courses,
      count: courses.length,
    })
  } catch (error) {
    console.error("=== GET COURSES ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

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
