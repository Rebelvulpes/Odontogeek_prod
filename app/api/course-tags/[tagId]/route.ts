import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const { name, color, description } = await req.json()

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "El nombre de la etiqueta es requerido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear slug a partir del nombre actualizado
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .trim()

    // Verificar si el slug ya existe en otra etiqueta
    const { data: existingTag } = await supabase
      .from("course_tags")
      .select("id")
      .eq("slug", slug)
      .neq("id", params.tagId)
      .single()

    if (existingTag) {
      return NextResponse.json({
        success: false,
        message: "Ya existe una etiqueta con ese nombre",
      })
    }

    const { data: updatedTag, error } = await supabase
      .from("course_tags")
      .update({
        name,
        slug,
        color: color || "#3B82F6",
        description,
      })
      .eq("id", params.tagId)
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error actualizando etiqueta: ${error.message}`,
      })
    }

    if (!updatedTag || updatedTag.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Etiqueta no encontrada",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Etiqueta actualizada exitosamente",
      data: updatedTag[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si la etiqueta está siendo usada por algún curso
    const { data: courseRelations, error: relationsError } = await supabase
      .from("course_tag_relations")
      .select("course_id")
      .eq("tag_id", params.tagId)

    if (relationsError) {
      return NextResponse.json({
        success: false,
        message: `Error verificando uso de etiqueta: ${relationsError.message}`,
      })
    }

    if (courseRelations && courseRelations.length > 0) {
      return NextResponse.json({
        success: false,
        message: `No se puede eliminar la etiqueta porque está siendo usada por ${courseRelations.length} curso(s). Primero remuévela de todos los cursos.`,
      })
    }

    // Eliminar la etiqueta
    const { error: deleteError } = await supabase.from("course_tags").delete().eq("id", params.tagId)

    if (deleteError) {
      return NextResponse.json({
        success: false,
        message: `Error eliminando etiqueta: ${deleteError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Etiqueta eliminada exitosamente",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
