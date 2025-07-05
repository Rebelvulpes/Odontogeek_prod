import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { tagId } = params

    const { name, color } = body

    // Validar campos requeridos
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "El campo nombre es requerido",
        },
        { status: 400 },
      )
    }

    // Generar slug del nombre
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // Actualizar el tag
    const { data: tag, error: tagError } = await supabase
      .from("course_tags")
      .update({
        name,
        slug,
        color: color || "#3B82F6",
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

    // Eliminar relaciones del tag con cursos
    const { error: relationsError } = await supabase.from("course_tag_relations").delete().eq("tag_id", tagId)

    if (relationsError) {
      console.error("Error eliminando relaciones del tag:", relationsError)
      // No fallar si no existe la tabla de relaciones
    }

    // Eliminar el tag
    const { error: tagError } = await supabase.from("course_tags").delete().eq("id", tagId)

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
