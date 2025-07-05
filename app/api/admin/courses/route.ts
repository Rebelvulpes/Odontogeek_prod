import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos básicos primero
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
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

    // Obtener conteo de lecciones para cada curso
    const coursesWithCounts = await Promise.all(
      (courses || []).map(async (course) => {
        // Contar lecciones
        const { count: lessonsCount } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Contar enrollments
        const { count: enrollmentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          lessonsCount: lessonsCount || 0,
          students: enrollmentsCount || 0,
          revenue: (enrollmentsCount || 0) * (course.price || 0),
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: coursesWithCounts,
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

    const { title, description, price, instructor, thumbnail_url, duration_hours } = body

    // Validar campos requeridos
    if (!title || !description || !instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Los campos título, descripción e instructor son requeridos",
        },
        { status: 400 },
      )
    }

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: price ? Number.parseFloat(price) : 0,
          instructor_name: instructor,
          thumbnail_url: thumbnail_url || null,
          duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
          archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando curso",
          error: courseError,
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
