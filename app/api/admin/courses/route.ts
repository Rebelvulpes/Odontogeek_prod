import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${error.message}`,
      })
    }

    // Calcular estadísticas para cada curso
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Obtener número de estudiantes inscritos
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Obtener ingresos totales
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("course_id", course.id)
          .eq("status", "completed")

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        // Obtener número de lecciones
        const { count: lessonsCount } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          students: studentsCount || 0,
          revenue: totalRevenue,
          lessonsCount: lessonsCount || 0,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, price, instructor, duration_hours } = await req.json()

    if (!title || !description || !price || !instructor) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear el curso
    const { data: newCourse, error: createError } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price),
          instructor_id: null, // Por ahora sin instructor específico
          duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
          status: "draft",
        },
      ])
      .select()

    if (createError) {
      return NextResponse.json({
        success: false,
        message: `Error creando curso: ${createError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      data: newCourse[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
