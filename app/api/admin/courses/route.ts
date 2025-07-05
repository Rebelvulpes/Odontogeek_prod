import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos con conteo de lecciones
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo cursos:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo cursos",
          error: error,
        },
        { status: 500 },
      )
    }

    // Transformar los datos para incluir el conteo de lecciones
    const coursesWithStats =
      courses?.map((course) => ({
        ...course,
        lessonsCount: course.lessons?.[0]?.count || 0,
        students: 0, // Por ahora, se puede implementar después
        revenue: 0, // Por ahora, se puede implementar después
      })) || []

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
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
          price: Number.parseFloat(price) || 0,
          instructor_name: instructor,
          thumbnail_url: thumbnail_url || null,
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
