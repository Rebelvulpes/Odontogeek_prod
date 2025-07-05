import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos con estadísticas
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        *,
        lessons!inner(id),
        enrollments!inner(id)
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

    // Procesar datos para incluir conteos
    const processedCourses =
      courses?.map((course) => ({
        ...course,
        lessonsCount: course.lessons?.length || 0,
        students: course.enrollments?.length || 0,
        revenue: (course.enrollments?.length || 0) * (course.price || 0),
      })) || []

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

    const { title, description, price, instructor, thumbnail_url } = body

    if (!title || !description || !instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos requeridos: título, descripción e instructor",
        },
        { status: 400 },
      )
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: price ? Number.parseFloat(price) : 0,
        instructor_name: instructor,
        thumbnail_url: thumbnail_url || null,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
