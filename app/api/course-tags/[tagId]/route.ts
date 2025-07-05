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

    // Intentar actualizar en la tabla 'tags' primero
    let { data: tag, error } = await supabase
      .from("tags")
      .update({
        name: name,
        color: color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tagId)
      .select()
      .single()

    // Si la tabla 'tags' no existe, usar 'course_tags'
    if (error && error.message.includes("does not exist")) {
      const result = await supabase
        .from("course_tags")
        .update({
          name: name,
          color: color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tagId)
        .select()
        .single()

      tag = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ success: false, message: "Error actualizando tag", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Tag actualizado exitosamente",
      data: tag,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tagId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { tagId } = params

    // Intentar eliminar de la tabla 'tags' primero
    let { error } = await supabase.from("tags").delete().eq("id", tagId)

    // Si la tabla 'tags' no existe, usar 'course_tags'
    if (error && error.message.includes("does not exist")) {
      const result = await supabase.from("course_tags").delete().eq("id", tagId)
      error = result.error
    }

    if (error) {
      return NextResponse.json({ success: false, message: "Error eliminando tag", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Tag eliminado exitosamente",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
