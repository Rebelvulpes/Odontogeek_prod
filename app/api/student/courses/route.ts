import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const userData = JSON.parse(userSession)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos del estudiante con información de progreso
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        progress_percentage,
        completed_at,
        last_accessed_at,
        created_at,
        updated_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          duration_hours,
          instructor,
          price,
          status,
          lessons (
            id,
            title,
            duration_minutes
          )
        )
      `)
      .eq("user_id", userData.id)
      .eq("courses.status", "published")

    if (error) {
      console.error("Error fetching student courses:", error)
      return NextResponse.json({
        success: false,
        message: "Error obteniendo cursos",
      })
    }

    // Procesar datos para incluir información de progreso de lecciones
    const coursesWithProgress = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        const course = enrollment.courses

        // Obtener progreso de lecciones
        const { data: lessonProgress } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", userData.id)
          .in(
            "lesson_id",
            course.lessons.map((l: any) => l.id),
          )

        const completedLessons = lessonProgress?.filter((lp) => lp.completed).length || 0

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          duration_hours: course.duration_hours,
          instructor: course.instructor,
          price: course.price,
          enrollment: {
            id: enrollment.id,
            status: enrollment.status,
            progress_percentage: enrollment.progress_percentage,
            completed_at: enrollment.completed_at,
            last_accessed_at: enrollment.last_accessed_at,
            created_at: enrollment.created_at,
          },
          lessons: {
            total: course.lessons.length,
            completed: completedLessons,
            list: course.lessons,
          },
          is_completed: enrollment.status === "completed" || enrollment.progress_percentage >= 100,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: coursesWithProgress,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
