import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  console.log("=== STUDENT DASHBOARD DATA REQUEST START ===")
  console.log("Timestamp:", new Date().toISOString())

  const sessionCookie = req.cookies.get("user-session")
  console.log("Session cookie exists:", !!sessionCookie)

  if (!sessionCookie) {
    console.log("❌ NO SESSION COOKIE FOUND")
    return NextResponse.json(
      { success: false, message: "No hay sesión activa. Por favor, inicia sesión.", error: "NO_SESSION" },
      { status: 401 },
    )
  }

  let userSession
  try {
    userSession = JSON.parse(sessionCookie.value)
    console.log("Session parsed successfully for user ID:", userSession.id)
  } catch (e) {
    console.log("❌ INVALID SESSION COOKIE (JSON PARSE FAILED)")
    return NextResponse.json({ success: false, message: "Sesión inválida.", error: "INVALID_SESSION" }, { status: 401 })
  }

  if (!userSession || !userSession.id) {
    console.log("❌ INVALID SESSION DATA (MISSING ID)")
    return NextResponse.json(
      { success: false, message: "Datos de sesión corruptos.", error: "CORRUPT_SESSION" },
      { status: 401 },
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch enrolled courses with progress
    console.log(`Fetching courses for user: ${userSession.id}`)
    const { data: coursesData, error: coursesError } = await supabase
      .from("enrollments")
      .select(
        `
        progress,
        status,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `,
      )
      .eq("user_id", userSession.id)

    if (coursesError) {
      console.error("❌ Error fetching courses:", coursesError)
      throw new Error("Error al cargar los cursos.")
    }
    console.log(`Found ${coursesData.length} enrolled courses.`)

    const formattedCourses = coursesData
      .filter((enrollment) => enrollment.courses) // Filter out null courses
      .map((enrollment) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        thumbnail_url: enrollment.courses.thumbnail_url,
        progress: enrollment.progress,
        status: enrollment.status,
      }))

    // Calculate statistics
    const totalCourses = formattedCourses.length
    const completedCourses = formattedCourses.filter((c) => c.status === "completed").length
    const inProgressCourses = totalCourses - completedCourses

    const dashboardData = {
      user: {
        first_name: userSession.first_name,
        last_name: userSession.last_name,
      },
      courses: formattedCourses,
      statistics: {
        totalCourses,
        completedCourses,
        inProgressCourses,
      },
    }

    console.log("✅ Successfully prepared dashboard data.")
    return NextResponse.json({ success: true, data: dashboardData })
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error interno del servidor.",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
