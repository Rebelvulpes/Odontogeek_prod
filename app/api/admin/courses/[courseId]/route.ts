import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const courseId = params.courseId

    if (body.archived !== undefined) {
      // Archivar/desarchivar curso
      const { error } = await supabase.from("courses").update({ archived: body.archived }).eq("id", courseId)

      if (error) {
        return NextResponse.json({
          success: false,
          message: "Error archivando curso: " + error.message,
        })
      }

      return NextResponse.json({
        success: true,
        message: body.archived ? "Curso archivado exitosamente" : "Curso restaurado exitosamente",
      })
    } else {
      // Actualizar curso completo
      const { title, description, price, instructor, thumbnail_url, duration_hours, tags } = body

      // Actualizar datos básicos del curso
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title,
          description,
          price,
          instructor_name: instructor,
          thumbnail_url,
          duration_hours,
        })
        .eq("id", courseId)

      if (updateError) {
        return NextResponse.json({
          success: false,
          message: "Error actualizando curso: " + updateError.message,
        })
      }

      // Actualizar etiquetas si se proporcionaron
      if (tags !== undefined) {
        // Eliminar etiquetas existentes
        await supabase.from("course_tags").delete().eq("course_id", courseId)

        // Agregar nuevas etiquetas
        if (tags.length > 0) {
          const tagAssociations = tags.map((tagId: string) => ({
            course_id: courseId,
            tag_id: tagId,
          }))

          const { error: tagsError } = await supabase.from("course_tags").insert(tagAssociations)

          if (tagsError) {
            console.error("Error actualizando etiquetas:", tagsError)
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Curso actualizado exitosamente",
      })
    }
  } catch (error) {
    console.error("Error en PUT de curso:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const courseId = params.courseId

    // Eliminar en orden: inscripciones, etiquetas, lecciones, curso
    await supabase.from("enrollments").delete().eq("course_id", courseId)
    await supabase.from("course_tags").delete().eq("course_id", courseId)
    await supabase.from("lessons").delete().eq("course_id", courseId)

    const { error } = await supabase.from("courses").delete().eq("id", courseId)

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Error eliminando curso: " + error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente junto con todas sus lecciones y datos relacionados",
    })
  } catch (error) {
    console.error("Error en DELETE de curso:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
