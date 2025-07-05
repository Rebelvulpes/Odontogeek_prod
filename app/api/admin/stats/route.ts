import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener conteo de usuarios
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Obtener conteo de cursos
    const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

    // Obtener conteo de lecciones
    const { count: totalLessons } = await supabase.from("lessons").select("*", { count: "exact", head: true })

    // Calcular ingresos totales
    const { data: courses } = await supabase.from("courses").select("id, price")

    let totalRevenue = 0
    if (courses) {
      for (const course of courses) {
        const { count: enrollments } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        totalRevenue += (enrollments || 0) * (course.price || 0)
      }
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
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
