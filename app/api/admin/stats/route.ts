import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Obtener estadísticas de usuarios
    const { data: usersData, error: usersError } = await supabase.from("users").select("id")

    if (usersError) {
      console.error("Error obteniendo usuarios:", usersError)
    }

    // Obtener estadísticas de cursos
    const { data: coursesData, error: coursesError } = await supabase.from("courses").select("id, price")

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({ success: false, message: "Error obteniendo cursos" }, { status: 500 })
    }

    // Obtener estadísticas de lecciones
    const { data: lessonsData, error: lessonsError } = await supabase.from("lessons").select("id")

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
    }

    // Obtener inscripciones reales (debería ser 0)
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id, course_id")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    // Calcular estadísticas reales
    const totalUsers = usersData?.length || 0
    const totalCourses = coursesData?.length || 0
    const totalLessons = lessonsData?.length || 0
    const totalEnrollments = enrollmentsData?.length || 0

    // Calcular ingresos reales basados en inscripciones reales
    let totalRevenue = 0
    if (enrollmentsData && enrollmentsData.length > 0 && coursesData) {
      const courseMap = new Map(coursesData.map((course) => [course.id, course.price]))
      totalRevenue = enrollmentsData.reduce((sum, enrollment) => {
        const coursePrice = courseMap.get(enrollment.course_id) || 0
        return sum + coursePrice
      }, 0)
    }

    // Estadísticas por curso (solo datos reales)
    const courseStats = []
    if (coursesData) {
      for (const course of coursesData) {
        const courseEnrollments = enrollmentsData?.filter((e) => e.course_id === course.id) || []
        const courseRevenue = courseEnrollments.length * (course.price || 0)

        courseStats.push({
          courseId: course.id,
          students: courseEnrollments.length, // Número real de estudiantes
          revenue: courseRevenue, // Ingresos reales
        })
      }
    }

    // Datos de crecimiento (últimos 7 días) - solo datos reales
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentEnrollments } = await supabase
      .from("enrollments")
      .select("enrolled_at")
      .gte("enrolled_at", sevenDaysAgo.toISOString())

    const recentEnrollmentsCount = recentEnrollments?.length || 0

    const stats = {
      totalUsers,
      totalCourses,
      totalLessons,
      totalEnrollments,
      totalRevenue,
      recentEnrollments: recentEnrollmentsCount,
      courseStats,
      // Métricas adicionales
      averageRevenuePerCourse: totalCourses > 0 ? totalRevenue / totalCourses : 0,
      averageStudentsPerCourse: totalCourses > 0 ? totalEnrollments / totalCourses : 0,
    }

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Estadísticas obtenidas correctamente (solo datos reales)",
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
