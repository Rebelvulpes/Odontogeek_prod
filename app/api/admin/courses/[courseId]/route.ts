import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    const { data: course, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free,
          archived,
          created_at
        ),
        tags:course_tag_relations(
          course_tags(
            id,
            name,
            slug,
            color,
            description
          )
        )
      `)
      .eq("id", courseId)
      .single()

    if (error) {
      console.error("Error obteniendo curso:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo curso: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Error interno en GET /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const body = await req.json()
    const { courseId } = params
    const { title, description, price, instructor, thumbnail_url, duration_hours, tags, archived } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Actualizar el curso
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (instructor !== undefined) updateData.instructor_name = instructor
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (duration_hours !== undefined)
      updateData.duration_hours = duration_hours ? Number.parseInt(duration_hours) : null
    if (archived !== undefined) updateData.archived = archived

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

    // Eliminar relaciones de etiquetas
    await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar inscripciones del curso
    try {
      await supabase.from("enrollments").delete().eq("course_id", courseId)
    } catch (enrollmentError) {
      console.log("Tabla enrollments no existe, continuando...")
    }

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
