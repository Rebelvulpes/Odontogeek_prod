import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener estadísticas básicas
    const [usersResult, coursesResult, lessonsResult, enrollmentsResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase.from("enrollments").select("amount", { count: "exact" }),
    ])

    // Calcular ingresos totales
    let totalRevenue = 0
    if (enrollmentsResult.data && Array.isArray(enrollmentsResult.data)) {
      totalRevenue = enrollmentsResult.data.reduce((sum, enrollment) => {
        return sum + (enrollment.amount || 0)
      }, 0)
    }

    const stats = {
      totalUsers: usersResult.count || 0,
      totalCourses: coursesResult.count || 0,
      totalLessons: lessonsResult.count || 0,
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
