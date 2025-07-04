import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const { lessonId } = params
    const body = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Actualizar la lección
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .update(body)
      .eq("id", lessonId)
      .select()
      .single()

    if (lessonError) {
      console.error("Error actualizando lección:", lessonError)
      return NextResponse.json({
        success: false,
        message: `Error actualizando lección: ${lessonError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: lesson,
      message: "Lección actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en PUT /api/admin/lessons/[lessonId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const { lessonId } = params

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Eliminar la lección
    const { error: lessonError } = await supabase.from("lessons").delete().eq("id", lessonId)

    if (lessonError) {
      console.error("Error eliminando lección:", lessonError)
      return NextResponse.json({
        success: false,
        message: `Error eliminando lección: ${lessonError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lección eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/admin/lessons/[lessonId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
