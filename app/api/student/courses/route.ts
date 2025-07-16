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

    // Obtener cursos del estudiante con información completa
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          instructor,
          lessons (
            id,
            title,
            duration_minutes
          )
        )
      `)
      .eq("user_id", userData.id)
      .eq("status", "active")

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError)
      return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
    }

    // Procesar datos para incluir progreso
    const coursesWithProgress = await Promise.all(
      (enrollments || []).map(async (enrollment: any) => {
        const course = enrollment.courses

        if (!course) return null

        // Contar lecciones totales
        const totalLessons = course.lessons?.length || 0

        // Contar lecciones completadas
        const { data: completedLessons } = await supabase
          .from("lesson_progress")
          .select("id")
          .eq("user_id", userData.id)
          .eq("course_id", course.id)
          .eq("is_completed", true)

        const completedCount = completedLessons?.length || 0
        const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          instructor: course.instructor || "Instructor",
          total_lessons: totalLessons,
          completed_lessons: completedCount,
          progress_percentage: Math.round(progressPercentage * 100) / 100,
          enrolled_at: enrollment.enrolled_at,
          status: enrollment.status,
          is_completed: progressPercentage >= 100,
        }
      }),
    )

    // Filtrar cursos nulos
    const validCourses = coursesWithProgress.filter((course) => course !== null)

    return NextResponse.json({
      success: true,
      courses: validCourses,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
