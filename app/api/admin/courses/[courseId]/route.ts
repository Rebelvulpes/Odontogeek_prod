import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params
    const body = await request.json()

    console.log("Actualizando curso:", courseId, "con datos:", body)

    // Extraer datos del cuerpo
    const { title, description, price, instructor, thumbnail_url, duration_hours, tags, archived } = body

    // Preparar datos de actualización
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (instructor !== undefined) updateData.instructor_name = instructor
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (duration_hours !== undefined)
      updateData.duration_hours = duration_hours ? Number.parseInt(duration_hours) : null
    if (archived !== undefined) updateData.archived = archived

    // Actualizar el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", courseId)
      .select()
      .single()

    if (courseError) {
      console.error("Error actualizando curso:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error actualizando curso: ${courseError.message}`,
      })
    }

    // Si se proporcionaron etiquetas, actualizar las asociaciones
    if (tags !== undefined && Array.isArray(tags)) {
      // Eliminar asociaciones existentes
      const { error: deleteError } = await supabase.from("course_tags").delete().eq("course_id", courseId)

      if (deleteError) {
        console.error("Error eliminando etiquetas existentes:", deleteError)
      }

      // Crear nuevas asociaciones
      if (tags.length > 0) {
        const tagAssociations = tags.map((tagId: string) => ({
          course_id: courseId,
          course_tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("course_tags").insert(tagAssociations)

        if (tagsError) {
          console.error("Error asociando nuevas etiquetas:", tagsError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: archived ? "Curso archivado exitosamente" : "Curso actualizado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error interno en PUT /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    console.log("Eliminando curso:", courseId)

    // Primero eliminar las lecciones asociadas
    const { error: lessonsError } = await supabase.from("lessons").delete().eq("course_id", courseId)

    if (lessonsError) {
      console.error("Error eliminando lecciones:", lessonsError)
    }

    // Eliminar asociaciones de etiquetas
    const { error: tagsError } = await supabase.from("course_tags").delete().eq("course_id", courseId)

    if (tagsError) {
      console.error("Error eliminando asociaciones de etiquetas:", tagsError)
    }

    // Eliminar inscripciones asociadas
    const { error: enrollmentsError } = await supabase.from("enrollments").delete().eq("course_id", courseId)

    if (enrollmentsError) {
      console.error("Error eliminando inscripciones:", enrollmentsError)
    }

    // Finalmente eliminar el curso
    const { error: courseError } = await supabase.from("courses").delete().eq("id", courseId)

    if (courseError) {
      console.error("Error eliminando curso:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error eliminando curso: ${courseError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Curso y todos sus datos asociados eliminados exitosamente",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
