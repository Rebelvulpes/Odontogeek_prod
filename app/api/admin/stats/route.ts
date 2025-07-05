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

    // Obtener ingresos totales de la tabla enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("amount")
      .eq("payment_status", "completed")

    if (enrollmentsError) {
      console.error("Error obteniendo enrollments:", enrollmentsError)
    }

    // Calcular ingresos totales
    const totalRevenue = enrollments?.reduce((sum, enrollment) => sum + (enrollment.amount || 0), 0) || 0

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
