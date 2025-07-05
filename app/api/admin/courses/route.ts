import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos con el conteo de lecciones
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        *,
        lessons!inner(count)
      `)
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo cursos",
          error: coursesError,
        },
        { status: 500 },
      )
    }

    // Obtener estadísticas de inscripciones por curso
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id, user_id")

    let enrollmentStats: Record<string, number> = {}
    if (!enrollmentsError && Array.isArray(enrollments)) {
      enrollmentStats = enrollments.reduce((acc: Record<string, number>, enrollment) => {
        acc[enrollment.course_id] = (acc[enrollment.course_id] || 0) + 1
        return acc
      }, {})
    }

    // Procesar los datos de cursos
    const processedCourses = Array.isArray(courses)
      ? courses.map((course) => ({
          ...course,
          lessonsCount: course.lessons?.[0]?.count || 0,
          students: enrollmentStats[course.id] || 0,
          revenue: (enrollmentStats[course.id] || 0) * (course.price || 0),
        }))
      : []

    return NextResponse.json({
      success: true,
      data: processedCourses,
    })
  } catch (error) {
    console.error("Error en GET cursos:", error)
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Validar campos requeridos
    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          message: "Título y descripción son requeridos",
        },
        { status: 400 },
      )
    }

    const { title, description, price, instructor, thumbnail_url } = body

    const { data: course, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: price ? Number.parseFloat(price) : 0,
          instructor_name: instructor || "",
          thumbnail_url: thumbnail_url || null,
          archived: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creando curso:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando curso",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error en POST curso:", error)
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
