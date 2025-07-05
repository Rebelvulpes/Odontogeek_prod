import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener total de usuarios
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Error obteniendo usuarios:", usersError)
    }

    // Obtener total de cursos
    const { count: totalCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
    }

    // Obtener total de lecciones
    const { count: totalLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
    }

    // Obtener enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("course_id")

    let totalRevenue = 0
    if (enrollments && !enrollmentsError) {
      // Obtener precios de cursos por separado
      const courseIds = [...new Set(enrollments.map((e) => e.course_id))]
      if (courseIds.length > 0) {
        const { data: courses, error: coursesRevenueError } = await supabase
          .from("courses")
          .select("id, price")
          .in("id", courseIds)

        if (courses && !coursesRevenueError) {
          // Calcular revenue basado en enrollments y precios
          const courseMap = new Map(courses.map((c) => [c.id, c.price]))
          totalRevenue = enrollments.reduce((sum, enrollment) => {
            const coursePrice = courseMap.get(enrollment.course_id) || 0
            return sum + coursePrice
          }, 0)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalLessons: totalLessons || 0,
        totalRevenue: totalRevenue,
      },
    })
  } catch (error) {
    console.error("Error en la ruta de estadísticas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
