import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userData = JSON.parse(userSession)
    const userId = userData.id

    console.log("Fetching courses for user:", userId)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener enrollments del usuario con información del curso
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses:course_id (
          id,
          title,
          description,
          thumbnail_url,
          duration_hours,
          instructor,
          price,
          lessons:lessons (
            id,
            title,
            order_index
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("Enrollments query result:", {
      success: !enrollmentsError,
      error: enrollmentsError,
      count: enrollments?.length || 0,
    })

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError)
      return NextResponse.json({ error: "Error obteniendo cursos" }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No tienes cursos inscritos",
      })
    }

    // Obtener progreso de lecciones para cada curso
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.courses
        if (!course) return null

        // Obtener progreso de lecciones para este curso
        const { data: lessonProgress, error: progressError } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", userId)
          .in("lesson_id", course.lessons?.map((l: any) => l.id) || [])

        if (progressError) {
          console.error("Error fetching lesson progress:", progressError)
        }

        const totalLessons = course.lessons?.length || 0
        const completedLessons = lessonProgress?.filter((lp) => lp.completed).length || 0
        const calculatedProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

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
            progress_percentage: enrollment.progress_percentage || calculatedProgress,
            completed_at: enrollment.completed_at,
            last_accessed_at: enrollment.last_accessed_at,
            created_at: enrollment.created_at,
          },
          lessons: {
            total: totalLessons,
            completed: completedLessons,
            list: course.lessons || [],
          },
          is_completed: calculatedProgress >= 100,
        }
      }),
    )

    const validCourses = coursesWithProgress.filter((course) => course !== null)

    console.log("Processed courses:", validCourses.length)

    return NextResponse.json({
      success: true,
      data: validCourses,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
