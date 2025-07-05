import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener total de usuarios reales
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Error obteniendo usuarios:", usersError)
    }

    // Obtener total de cursos no archivados
    const { count: totalCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
    }

    // Obtener total de lecciones no archivadas
    const { count: totalLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
    }

    // Calcular ingresos reales (solo si hay inscripciones reales)
    let totalRevenue = 0
    try {
      // Verificar si la tabla enrollments existe y tiene datos
      const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("course_id")

      if (!enrollmentsError && enrollments && enrollments.length > 0) {
        // Solo calcular si hay inscripciones reales
        const uniqueCourseIds = [...new Set(enrollments.map((e) => e.course_id))]

        if (uniqueCourseIds.length > 0) {
          const { data: courses, error: coursePricesError } = await supabase
            .from("courses")
            .select("id, price")
            .in("id", uniqueCourseIds)

          if (!coursePricesError && courses) {
            const priceMap = courses.reduce((acc, course) => {
              acc[course.id] = course.price || 0
              return acc
            }, {})

            totalRevenue = enrollments.reduce((total, enrollment) => {
              return total + (priceMap[enrollment.course_id] || 0)
            }, 0)
          }
        }
      } else {
        // No hay inscripciones, ingresos = 0
        totalRevenue = 0
      }
    } catch (revenueError) {
      console.error("Error calculando ingresos:", revenueError)
      totalRevenue = 0
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
    console.error("Error interno en GET /api/admin/stats:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
      data: {
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalRevenue: 0,
      },
    })
  }
}
