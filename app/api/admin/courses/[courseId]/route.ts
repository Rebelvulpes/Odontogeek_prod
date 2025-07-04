import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const courseId = params.courseId

    const { title, description, price, instructor, thumbnail_url, duration_hours, tags, archived } = body

    // Actualizar el curso
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (instructor !== undefined) updateData.instructor_name = instructor
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (duration_hours !== undefined)
      updateData.duration_hours = duration_hours ? Number.parseInt(duration_hours) : null
    if (archived !== undefined) updateData.archived = archived

    updateData.updated_at = new Date().toISOString()

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

    // Actualizar etiquetas si se proporcionaron
    if (tags !== undefined && Array.isArray(tags)) {
      // Eliminar etiquetas existentes
      await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

      // Agregar nuevas etiquetas
      if (tags.length > 0) {
        const tagAssociations = tags.map((tagId: string) => ({
          course_id: courseId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("course_tag_relations").insert(tagAssociations)

        if (tagsError) {
          console.error("Error actualizando etiquetas:", tagsError)
          // No fallar por esto, solo logear
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Curso actualizado exitosamente",
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
    const courseId = params.courseId

    // Eliminar relaciones de etiquetas primero
    await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar inscripciones del curso
    await supabase.from("enrollments").delete().eq("course_id", courseId)

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
      message: "Curso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
