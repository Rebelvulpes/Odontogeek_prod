import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { course_id, title, description, video_url, duration_minutes, order_index, is_free } = await req.json()

    if (!course_id || !title || !video_url || !duration_minutes || !order_index) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos requeridos deben estar completos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar que el curso existe
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({
        success: false,
        message: "El curso especificado no existe",
      })
    }

    // Crear la lección
    const { data: newLesson, error: createError } = await supabase
      .from("lessons")
      .insert([
        {
          course_id,
          title,
          description,
          video_url,
          duration_minutes: Number.parseInt(duration_minutes),
          order_index: Number.parseInt(order_index),
          is_free: is_free || false,
        },
      ])
      .select()

    if (createError) {
      return NextResponse.json({
        success: false,
        message: `Error creando lección: ${createError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lección creada exitosamente",
      data: newLesson[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
