import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT COURSES ===")

    // Obtener sesión del usuario
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      console.log("❌ No session cookie")
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (parseError) {
      console.log("❌ Error parsing session:", parseError)
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    if (!sessionData.id) {
      console.log("❌ No user ID in session")
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    console.log("Getting courses for user:", sessionData.id)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos del estudiante con información completa
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        enrolled_at,
        completed_at,
        created_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          duration_hours,
          level,
          status,
          instructor,
          created_at
        )
      `)
      .eq("user_id", sessionData.id)
      .order("enrolled_at", { ascending: false })

    if (enrollmentsError) {
      console.error("❌ Error fetching enrollments:", enrollmentsError)
      return NextResponse.json({
        success: false,
        message: "Error obteniendo cursos",
      })
    }

    console.log("Found enrollments:", enrollments?.length || 0)

    // Formatear datos para el frontend
    const courses =
      enrollments?.map((enrollment) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        thumbnail_url: enrollment.courses.thumbnail_url || "/placeholder.jpg",
        price: enrollment.courses.price,
        duration_hours: enrollment.courses.duration_hours,
        level: enrollment.courses.level,
        instructor: enrollment.courses.instructor,
        progress: enrollment.progress || 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        enrollment_id: enrollment.id,
      })) || []

    console.log("✅ Returning courses:", courses.length)

    return NextResponse.json({
      success: true,
      courses,
    })
  } catch (error) {
    console.error("❌ Error in student courses:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
