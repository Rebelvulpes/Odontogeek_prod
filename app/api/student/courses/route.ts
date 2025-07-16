import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    const userSession = JSON.parse(sessionCookie.value)

    if (userSession.role !== "student") {
      return NextResponse.json({
        success: false,
        message: "Acceso no autorizado",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos del estudiante con información completa
    const { data: enrollments, error } = await supabase
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
          duration,
          level,
          instructor,
          price,
          lessons (
            id,
            title,
            duration
          )
        )
      `)
      .eq("user_id", userSession.id)

    if (error) {
      console.error("Error fetching student courses:", error)
      return NextResponse.json({
        success: false,
        message: "Error al obtener cursos",
      })
    }

    // Formatear datos para el frontend
    const formattedCourses =
      enrollments?.map((enrollment) => ({
        enrollmentId: enrollment.id,
        progress: enrollment.progress || 0,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at,
        course: {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description,
          thumbnail_url: enrollment.courses.thumbnail_url || "/placeholder.jpg",
          duration: enrollment.courses.duration,
          level: enrollment.courses.level,
          instructor: enrollment.courses.instructor,
          price: enrollment.courses.price,
          totalLessons: enrollment.courses.lessons?.length || 0,
        },
      })) || []

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
