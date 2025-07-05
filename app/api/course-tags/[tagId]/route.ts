import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

export async function PUT(req: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const { tagId } = params
    const body = await req.json()
    const { name, color, description } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generar nuevo slug
    const slug = generateSlug(name)

    // Verificar si el slug ya existe (excluyendo la etiqueta actual)
    const { data: existingTag } = await supabase
      .from("course_tags")
      .select("id")
      .eq("slug", slug)
      .neq("id", tagId)
      .single()

    if (existingTag) {
      return NextResponse.json({
        success: false,
        message: "Ya existe una etiqueta con ese nombre",
      })
    }

    // Actualizar la etiqueta
    const { data: tag, error: tagError } = await supabase
      .from("course_tags")
      .update({
        name,
        slug,
        color: color || "#3B82F6",
        description: description || null,
      })
      .eq("id", tagId)
      .select()
      .single()

    if (tagError) {
      console.error("Error actualizando etiqueta:", tagError)
      return NextResponse.json({
        success: false,
        message: `Error actualizando etiqueta: ${tagError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: tag,
      message: "Etiqueta actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en PUT /api/course-tags/[tagId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const { tagId } = params

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si la etiqueta está siendo usada
    const { count: usageCount } = await supabase
      .from("course_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagId)

    if (usageCount && usageCount > 0) {
      return NextResponse.json({
        success: false,
        message: `No se puede eliminar la etiqueta porque está siendo usada por ${usageCount} curso(s)`,
      })
    }

    // Eliminar la etiqueta
    const { error: tagError } = await supabase.from("course_tags").delete().eq("id", tagId)

    if (tagError) {
      console.error("Error eliminando etiqueta:", tagError)
      return NextResponse.json({
        success: false,
        message: `Error eliminando etiqueta: ${tagError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Etiqueta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/course-tags/[tagId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
