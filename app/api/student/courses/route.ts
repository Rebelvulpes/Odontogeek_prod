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
        *,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          instructor,
          price,
          duration_hours,
          created_at
        )
      `)
      .eq("user_id", userData.id)

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError)
      return NextResponse.json({ error: "Error obteniendo cursos" }, { status: 500 })
    }

    // Obtener progreso de lecciones para cada curso
    const coursesWithProgress = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        const courseId = enrollment.course_id

        // Contar total de lecciones del curso
        const { count: totalLessons } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId)

        // Contar lecciones completadas por el usuario
        const { count: completedLessons } = await supabase
          .from("lesson_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id)
          .eq("course_id", courseId)
          .eq("completed", true)

        // Calcular porcentaje de progreso
        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

        return {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description,
          thumbnail_url: enrollment.courses.thumbnail_url,
          instructor: enrollment.courses.instructor || "Instructor",
          total_lessons: totalLessons || 0,
          completed_lessons: completedLessons || 0,
          progress_percentage: Math.round(progressPercentage * 100) / 100,
          enrolled_at: enrollment.enrolled_at,
          status: enrollment.status || "active",
          is_completed: progressPercentage >= 100,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      courses: coursesWithProgress,
    })
  } catch (error) {
    console.error("Error in /api/student/courses:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
