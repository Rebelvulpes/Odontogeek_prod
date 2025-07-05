import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { tagId } = params

    const { data: tag, error } = await supabase.from("tags").select("*").eq("id", tagId).single()

    if (error) {
      console.error("Error obteniendo tag:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo tag",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: tag,
    })
  } catch (error) {
    console.error("Error en GET tag:", error)
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

export async function PUT(request: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { tagId } = params
    const body = await request.json()

    const { name, color } = body

    // Actualizar el tag
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .update({
        ...(name && { name }),
        ...(color && { color }),
      })
      .eq("id", tagId)
      .select()
      .single()

    if (tagError) {
      console.error("Error actualizando tag:", tagError)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando tag",
          error: tagError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tag actualizado exitosamente",
      data: tag,
    })
  } catch (error) {
    console.error("Error en PUT tag:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { tagId } = params

    // Eliminar relaciones del tag primero
    await supabase.from("course_tags").delete().eq("tag_id", tagId)

    // Eliminar el tag
    const { error: tagError } = await supabase.from("tags").delete().eq("id", tagId)

    if (tagError) {
      console.error("Error eliminando tag:", tagError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando tag",
          error: tagError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tag eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error en DELETE tag:", error)
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
