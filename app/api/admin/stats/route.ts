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

    // Obtener total de cursos (no archivados)
    const { count: totalCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
    }

    // Obtener total de lecciones (no archivadas)
    const { count: totalLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
    }

    // Obtener ingresos totales (solo inscripciones completadas)
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("amount_paid")
      .eq("payment_status", "completed")

    let totalRevenue = 0
    if (!enrollmentsError && enrollments) {
      totalRevenue = enrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.amount_paid || 0)
      }, 0)
    } else if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalLessons: totalLessons || 0,
        totalRevenue: totalRevenue || 0,
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
