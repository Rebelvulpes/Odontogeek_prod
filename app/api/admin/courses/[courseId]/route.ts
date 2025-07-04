import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: course, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(*),
        tags:course_tag_relations(
          course_tags(*)
        )
      `)
      .eq("id", params.courseId)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error obteniendo curso: ${error.message}`,
      })
    }

    // Transformar las etiquetas para que tengan la estructura correcta
    const courseWithTags = {
      ...course,
      tags: course.tags?.map((relation: any) => relation.course_tags) || [],
    }

    return NextResponse.json({
      success: true,
      data: courseWithTags,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const body = await req.json()
    const { title, description, price, instructor, thumbnail_url, duration_hours, tags, archived } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Preparar datos de actualización
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Solo agregar campos que no sean undefined
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (instructor !== undefined) updateData.instructor_name = instructor // Mapear a instructor_name
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

    // Actualizar etiquetas si se proporcionaron
    if (tags && Array.isArray(tags)) {
      // Eliminar etiquetas existentes
      await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

      // Agregar nuevas etiquetas
      if (tags.length > 0) {
        const tagRelations = tags.map((tagId: string) => ({
          course_id: courseId,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase.from("course_tag_relations").insert(tagRelations)

        if (tagError) {
          console.error("Error actualizando etiquetas:", tagError)
          // No fallar la actualización del curso por las etiquetas
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Curso actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error interno en PUT /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el curso tiene inscripciones
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)

    if (enrollmentsError) {
      console.error("Error verificando inscripciones:", enrollmentsError)
      return NextResponse.json({
        success: false,
        message: "Error verificando inscripciones del curso",
      })
    }

    if (enrollments && enrollments.length > 0) {
      return NextResponse.json({
        success: false,
        message: `No se puede eliminar el curso porque tiene ${enrollments.length} estudiante(s) inscrito(s). Considera archivarlo en su lugar.`,
      })
    }

    // Eliminar relaciones de etiquetas
    await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar el curso
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
