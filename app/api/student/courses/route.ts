import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    // Obtener usuario de la cookie
    const userSession = req.cookies.get("user-session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userData = JSON.parse(userSession)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener enrollments del usuario con información del curso
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        course_id,
        progress_percentage,
        enrolled_at,
        status,
        completed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          duration_hours,
          instructor_name,
          status
        )
      `)
      .eq("user_id", userData.id)
      .eq("status", "active")

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError)
      return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        courses: [],
      })
    }

    // Procesar cada enrollment para obtener información detallada
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Contar lecciones totales del curso
        const { count: totalLessons } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", enrollment.course_id)
          .eq("archived", false)

        // Contar lecciones completadas por el usuario
        const { count: completedLessons } = await supabase
          .from("lesson_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id)
          .eq("course_id", enrollment.course_id)
          .eq("is_completed", true)

        return {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description,
          thumbnail_url: enrollment.courses.thumbnail_url,
          instructor: enrollment.courses.instructor_name || "Instructor",
          total_lessons: totalLessons || 0,
          completed_lessons: completedLessons || 0,
          progress_percentage: enrollment.progress_percentage || 0,
          enrolled_at: enrollment.enrolled_at,
          status: enrollment.status,
          is_completed: enrollment.progress_percentage >= 100 || enrollment.completed_at !== null,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      courses: coursesWithProgress,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
