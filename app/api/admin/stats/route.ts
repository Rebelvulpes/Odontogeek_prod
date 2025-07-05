import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
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

    // Obtener ingresos totales usando la tabla correcta "enrollments"
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("amount_paid")
      .eq("payment_status", "completed")

    let totalRevenue = 0
    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    } else if (enrollments) {
      totalRevenue = enrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.amount_paid || 0)
      }, 0)
    }

    const stats = {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalLessons: totalLessons || 0,
      totalRevenue: totalRevenue,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error obteniendo estadísticas",
        data: {
          totalUsers: 0,
          totalCourses: 0,
          totalLessons: 0,
          totalRevenue: 0,
        },
      },
      { status: 500 },
    )
  }
}
