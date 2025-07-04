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
        courses:course_id(
          id,
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo lecciones:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo lecciones: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: lessons || [],
    })
  } catch (error) {
    console.error("Error interno en GET /api/admin/lessons:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { course_id, title, description, video_url, duration_minutes, order_index, is_free } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear la lección
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert({
        course_id,
        title,
        description,
        video_url,
        duration_minutes,
        order_index,
        is_free: is_free || false,
        archived: false,
      })
      .select()
      .single()

    if (lessonError) {
      console.error("Error creando lección:", lessonError)
      return NextResponse.json({
        success: false,
        message: `Error creando lección: ${lessonError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: lesson,
      message: "Lección creada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en POST /api/admin/lessons:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
