import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
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

    // Obtener etiquetas del curso
    const { data: tagRelations, error: tagError } = await supabase
      .from("course_tag_relations")
      .select(`
        course_tags:tag_id(
          id,
          name,
          color,
          slug,
          description
        )
      `)
      .eq("course_id", courseId)

    const tags = tagRelations?.map((relation) => relation.course_tags).filter(Boolean) || []

    // Obtener inscripciones reales para este curso
    let enrollmentCount = 0
    try {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)

      if (!enrollmentError && enrollments) {
        enrollmentCount = enrollments.length
      }
    } catch (error) {
      console.error("Error obteniendo inscripciones:", error)
      enrollmentCount = 0
    }

    const processedCourse = {
      ...course,
      lessons: course.lessons?.filter((lesson) => !lesson.archived) || [],
      tags: tags,
      students: enrollmentCount, // Número real de estudiantes
      revenue: enrollmentCount * (course.price || 0), // Ingresos reales
    }

    return NextResponse.json({
      success: true,
      data: processedCourse,
    })
  } catch (error) {
    console.error("Error interno en GET /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function PUT(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params
    const body = await request.json()

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
    if (tags !== undefined) {
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
    const { courseId } = params

    // Eliminar relaciones de etiquetas
    await supabase.from("course_tag_relations").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar inscripciones del curso (si existen)
    await supabase.from("enrollments").delete().eq("course_id", courseId)

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
      message: "Curso eliminado exitosamente junto con todas sus lecciones y dependencias",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
