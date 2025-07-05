import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select(`
        *,
        course:courses(
          id,
          title
        )
      `)
      .order("course_id", { ascending: true })
      .order("order_index", { ascending: true })

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

    const { title, content, video_url, course_id, order_index, duration } = body

    // Validar campos requeridos
    if (!title || !content || !course_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Los campos título, contenido y curso son requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar que el curso existe
    const { data: courseExists, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .single()

    if (courseError || !courseExists) {
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
          content,
          video_url: video_url || null,
          course_id: Number.parseInt(course_id),
          order_index: Number.parseInt(order_index) || 1,
          duration: duration || null,
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
