import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener lecciones con información del curso
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select(`
        *,
        courses!inner (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo lecciones:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo lecciones",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: lessons || [],
    })
  } catch (error) {
    console.error("Error en GET lecciones:", error)
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

    const { title, description, video_url, duration_minutes, course_id, order_index } = body

    // Validar campos requeridos
    if (!title || !description || !video_url || !course_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Los campos título, descripción, URL del video y curso son requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar que el curso existe
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        {
          success: false,
          message: "El curso especificado no existe",
        },
        { status: 400 },
      )
    }

    // Crear la lección
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          title,
          description,
          video_url,
          duration_minutes: Number.parseInt(duration_minutes) || 0,
          course_id,
          order_index: Number.parseInt(order_index) || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (lessonError) {
      console.error("Error creando lección:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando lección",
          error: lessonError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lección creada exitosamente",
      data: lesson,
    })
  } catch (error) {
    console.error("Error en POST lección:", error)
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
