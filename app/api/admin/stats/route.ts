import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener estadísticas básicas
    const [usersResult, coursesResult, lessonsResult, enrollmentsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("enrollments").select("amount"),
    ])

    // Calcular ingresos totales
    const totalRevenue =
      enrollmentsResult.data?.reduce((sum, enrollment) => {
        return sum + (enrollment.amount || 0)
      }, 0) || 0

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
    return NextResponse.json({
      success: false,
      message: "Error obteniendo estadísticas",
      data: {
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalRevenue: 0,
      },
    })
  }
}
