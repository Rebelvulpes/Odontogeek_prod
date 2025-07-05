import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener estadísticas de usuarios
    const { data: users, error: usersError } = await supabase.from("users").select("id")

    if (usersError) {
      console.error("Error obteniendo usuarios:", usersError)
    }

    // Obtener estadísticas de cursos
    const { data: courses, error: coursesError } = await supabase.from("courses").select("id, price")

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
    }

    // Obtener estadísticas de lecciones
    const { data: lessons, error: lessonsError } = await supabase.from("lessons").select("id")

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
    }

    // Obtener estadísticas de inscripciones (si existe la tabla)
    const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("id, course_id")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    // Calcular estadísticas
    const totalUsers = users?.length || 0
    const totalCourses = courses?.length || 0
    const totalLessons = lessons?.length || 0
    const totalEnrollments = enrollments?.length || 0

    // Calcular ingresos estimados (precio promedio * inscripciones)
    const averagePrice = courses?.reduce((sum, course) => sum + (course.price || 0), 0) / (courses?.length || 1) || 0
    const totalRevenue = averagePrice * totalEnrollments

    const stats = {
      totalUsers,
      totalCourses,
      totalLessons,
      totalRevenue: Math.round(totalRevenue),
      totalEnrollments,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error en GET stats:", error)
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
