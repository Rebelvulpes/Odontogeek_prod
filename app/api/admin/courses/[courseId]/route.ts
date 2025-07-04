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
    const body = await req.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Si solo se está archivando/desarchivando
    if ("archived" in body && Object.keys(body).length === 1) {
      const { data: updatedCourse, error } = await supabase
        .from("courses")
        .update({
          archived: body.archived,
        })
        .eq("id", params.courseId)
        .select()

      if (error) {
        return NextResponse.json({
          success: false,
          message: `Error ${body.archived ? "archivando" : "desarchivando"} curso: ${error.message}`,
        })
      }

      return NextResponse.json({
        success: true,
        message: `Curso ${body.archived ? "archivado" : "desarchivado"} exitosamente`,
        data: updatedCourse[0],
      })
    }

    // Actualización completa del curso
    const { title, description, price, instructor, duration_hours, thumbnail_url, tags } = body

    // Actualizar datos básicos del curso
    const { data: updatedCourse, error: courseError } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price: Number.parseFloat(price),
        instructor,
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        thumbnail_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.courseId)
      .select()

    if (courseError) {
      return NextResponse.json({
        success: false,
        message: `Error actualizando curso: ${courseError.message}`,
      })
    }

    // Actualizar etiquetas si se proporcionaron
    if (tags && Array.isArray(tags)) {
      // Eliminar relaciones existentes
      await supabase.from("course_tag_relations").delete().eq("course_id", params.courseId)

      // Agregar nuevas relaciones
      if (tags.length > 0) {
        const tagRelations = tags.map((tagId: string) => ({
          course_id: params.courseId,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase.from("course_tag_relations").insert(tagRelations)

        if (tagError) {
          console.error("Error actualizando etiquetas:", tagError)
          // No fallar la actualización por las etiquetas
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Curso actualizado exitosamente",
      data: updatedCourse[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el curso tiene lecciones
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", params.courseId)

    if (lessonsError) {
      return NextResponse.json({
        success: false,
        message: `Error verificando lecciones: ${lessonsError.message}`,
      })
    }

    // Verificar si hay inscripciones
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", params.courseId)

    if (enrollmentsError) {
      return NextResponse.json({
        success: false,
        message: `Error verificando inscripciones: ${enrollmentsError.message}`,
      })
    }

    // Si hay inscripciones, no permitir eliminación
    if (enrollments && enrollments.length > 0) {
      return NextResponse.json({
        success: false,
        message: `No se puede eliminar el curso porque tiene ${enrollments.length} estudiantes inscritos. Considera archivarlo en su lugar.`,
      })
    }

    // Eliminar relaciones de etiquetas primero
    await supabase.from("course_tag_relations").delete().eq("course_id", params.courseId)

    // Eliminar el curso (las lecciones se eliminarán automáticamente por CASCADE)
    const { error } = await supabase.from("courses").delete().eq("id", params.courseId)

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error eliminando curso: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Curso eliminado exitosamente${lessons && lessons.length > 0 ? ` junto con ${lessons.length} lecciones` : ""}`,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
