import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { lessonId } = params

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select(`
        *,
        courses!inner (
          id,
          title
        )
      `)
      .eq("id", lessonId)
      .single()

    if (error) {
      console.error("Error obteniendo lección:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo lección",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    })
  } catch (error) {
    console.error("Error en GET lección:", error)
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

export async function PUT(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { lessonId } = params
    const body = await request.json()

    const { title, description, video_url, duration_minutes, order_index } = body

    // Actualizar la lección
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(video_url !== undefined && { video_url }),
        ...(duration_minutes !== undefined && { duration_minutes: Number.parseInt(duration_minutes) }),
        ...(order_index !== undefined && { order_index: Number.parseInt(order_index) }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .select()
      .single()

    if (lessonError) {
      console.error("Error actualizando lección:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando lección",
          error: lessonError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lección actualizada exitosamente",
      data: lesson,
    })
  } catch (error) {
    console.error("Error en PUT lección:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { lessonId } = params

    // Eliminar la lección
    const { error: lessonError } = await supabase.from("lessons").delete().eq("id", lessonId)

    if (lessonError) {
      console.error("Error eliminando lección:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando lección",
          error: lessonError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lección eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error en DELETE lección:", error)
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
