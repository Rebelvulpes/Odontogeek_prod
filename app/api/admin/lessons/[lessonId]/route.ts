import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const body = await req.json()
    const { title, description, video_url, duration_minutes, order_index, is_free, archived } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Si es una operación de archivado
    if (archived !== undefined) {
      const { data: updatedLesson, error } = await supabase
        .from("lessons")
        .update({ archived: archived })
        .eq("id", params.lessonId)
        .select()

      if (error) {
        return NextResponse.json({
          success: false,
          message: `Error archivando lección: ${error.message}`,
        })
      }

      return NextResponse.json({
        success: true,
        message: archived ? "Lección archivada exitosamente" : "Lección restaurada exitosamente",
        data: updatedLesson[0],
      })
    }

    // Operación de actualización normal
    const { data: updatedLesson, error } = await supabase
      .from("lessons")
      .update({
        title,
        description,
        video_url,
        duration_minutes: Number.parseInt(duration_minutes),
        order_index: Number.parseInt(order_index),
        is_free: is_free || false,
      })
      .eq("id", params.lessonId)
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error actualizando lección: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lección actualizada exitosamente",
      data: updatedLesson[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.from("lessons").delete().eq("id", params.lessonId)

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error eliminando lección: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lección eliminada exitosamente",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
