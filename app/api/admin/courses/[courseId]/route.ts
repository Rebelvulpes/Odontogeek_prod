import { type NextRequest, NextResponse } from "next/server"
import { createClient, createRouteHandlerClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const supabasePublic = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params

    // Obtener curso con lecciones
    const { data: course, error: courseError } = await supabasePublic
      .from("courses")
      .select(`
        *,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          is_free,
          order_index
        )
      `)
      .eq("id", courseId)
      .single()

    if (courseError) {
      console.error("Error obteniendo curso:", courseError)
      return NextResponse.json({ success: false, message: "Curso no encontrado" }, { status: 404 })
    }

    // Obtener etiquetas del curso usando la relación correcta
    const { data: courseTags, error: courseTagsError } = await supabasePublic
      .from("course_tags")
      .select(`
        tags (
          id,
          name,
          color,
          slug
        )
      `)
      .eq("course_id", courseId)

    if (courseTagsError) {
      console.error("Error obteniendo etiquetas:", courseTagsError)
    }

    // Obtener inscripciones reales para este curso
    const { data: enrollments, error: enrollmentsError } = await supabasePublic
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    // Procesar datos
    const tags = courseTags?.map((ct) => ct.tags).filter(Boolean) || []
    const studentsCount = enrollments?.length || 0
    const revenue = studentsCount * (course.price || 0)

    const processedCourse = {
      ...course,
      tags,
      students: studentsCount,
      revenue,
      lessonsCount: course.lessons?.length || 0,
    }

    return NextResponse.json({
      success: true,
      data: processedCourse,
    })
  } catch (error) {
    console.error("Error en GET /api/admin/courses/[courseId]:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { courseId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { courseId } = params
    const body = await request.json()

    if (body.archived !== undefined) {
      // Solo actualizar el estado de archivado
      const { data, error } = await supabase
        .from("courses")
        .update({ archived: body.archived })
        .eq("id", courseId)
        .select()
        .single()

      if (error) {
        console.error("Error archivando curso:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Error archivando curso",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: body.archived ? "Curso archivado exitosamente" : "Curso restaurado exitosamente",
        data,
      })
    } else {
      // Actualización completa del curso
      const { title, description, price, instructor, thumbnail_url, duration_hours, tags } = body

      // Actualizar el curso
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .update({
          title,
          description,
          price: Number.parseFloat(price),
          instructor_name: instructor,
          thumbnail_url,
          duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .select()
        .single()

      if (courseError) {
        console.error("Error actualizando curso:", courseError)
        return NextResponse.json(
          {
            success: false,
            message: "Error actualizando curso",
          },
          { status: 500 },
        )
      }

      // Actualizar etiquetas si se proporcionaron
      if (tags !== undefined) {
        // Eliminar etiquetas existentes
        await supabase.from("course_tags").delete().eq("course_id", courseId)

        // Agregar nuevas etiquetas
        if (tags.length > 0) {
          const courseTagsData = tags.map((tagId) => ({
            course_id: courseId,
            tag_id: tagId,
          }))

          const { error: tagsError } = await supabase.from("course_tags").insert(courseTagsData)

          if (tagsError) {
            console.error("Error actualizando etiquetas:", tagsError)
            // No fallar por las etiquetas
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Curso actualizado exitosamente",
        data: course,
      })
    }
  } catch (error) {
    console.error("Error en PUT de curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { courseId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { courseId } = params

    // Verificar si el curso tiene inscripciones usando la tabla correcta "enrollments"
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .limit(1)

    if (enrollmentsError) {
      console.error("Error verificando inscripciones:", enrollmentsError)
    }

    if (enrollments && enrollments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se puede eliminar un curso que tiene estudiantes inscritos. Considera archivarlo en su lugar.",
        },
        { status: 400 },
      )
    }

    // Eliminar etiquetas del curso
    await supabase.from("course_tags").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar el curso
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId)

    if (deleteError) {
      console.error("Error eliminando curso:", deleteError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando curso",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente junto con todas sus lecciones",
    })
  } catch (error) {
    console.error("Error en DELETE de curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
