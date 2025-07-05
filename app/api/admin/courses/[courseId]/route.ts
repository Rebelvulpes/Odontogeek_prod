import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params

    // Obtener curso con lecciones
    const { data: course, error: courseError } = await supabase
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
    const { data: courseTags, error: courseTagsError } = await supabase
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
    const { data: enrollments, error: enrollmentsError } = await supabase
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

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const body = await request.json()
    const { title, description, price, instructor_name, thumbnail_url, status, archived, tags = [] } = body

    // Actualizar curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price,
        instructor_name,
        thumbnail_url,
        status,
        archived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .select()
      .single()

    if (courseError) {
      console.error("Error actualizando curso:", courseError)
      return NextResponse.json({ success: false, message: "Error actualizando curso" }, { status: 500 })
    }

    // Actualizar etiquetas - CORREGIDO para usar la estructura correcta
    // Primero eliminar etiquetas existentes
    const { error: deleteError } = await supabase.from("course_tags").delete().eq("course_id", courseId)

    if (deleteError) {
      console.error("Error eliminando etiquetas existentes:", deleteError)
    }

    // Luego insertar nuevas etiquetas si existen
    if (tags && tags.length > 0) {
      const courseTagsData = tags.map((tagId: string) => ({
        course_id: courseId,
        tag_id: tagId,
      }))

      const { error: insertError } = await supabase.from("course_tags").insert(courseTagsData)

      if (insertError) {
        console.error("Error insertando nuevas etiquetas:", insertError)
        // No fallar completamente si las etiquetas fallan, solo registrar el error
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Curso actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error en PUT /api/admin/courses/[courseId]:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params

    // Verificar si hay inscripciones reales
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)

    if (enrollmentsError) {
      console.error("Error verificando inscripciones:", enrollmentsError)
    }

    // Si hay inscripciones reales, no permitir eliminación
    if (enrollments && enrollments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se puede eliminar el curso porque tiene ${enrollments.length} estudiante(s) inscrito(s)`,
        },
        { status: 400 },
      )
    }

    // Eliminar etiquetas del curso
    await supabase.from("course_tags").delete().eq("course_id", courseId)

    // Eliminar lecciones del curso
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Eliminar curso
    const { error: courseError } = await supabase.from("courses").delete().eq("id", courseId)

    if (courseError) {
      console.error("Error eliminando curso:", courseError)
      return NextResponse.json({ success: false, message: "Error eliminando curso" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error en DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
