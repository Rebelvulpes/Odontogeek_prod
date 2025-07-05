import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: { courseId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const body = await request.json()
    const { title, description, price, instructor, thumbnail_url, duration_hours, tags, archived } = body

    // Actualizar el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price: price ? Number.parseFloat(price) : null,
        instructor_name: instructor,
        thumbnail_url,
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        archived: archived !== undefined ? archived : false,
      })
      .eq("id", params.courseId)
      .select()
      .single()

    if (courseError) {
      console.error("Error actualizando curso:", courseError)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando curso",
          error: courseError,
        },
        { status: 500 },
      )
    }

    // Si se proporcionaron etiquetas, actualizar las asociaciones
    if (tags !== undefined) {
      // Eliminar etiquetas existentes
      const { error: deleteError } = await supabase.from("course_tags").delete().eq("course_id", params.courseId)

      if (deleteError) {
        console.error("Error eliminando etiquetas existentes:", deleteError)
      }

      // Agregar nuevas etiquetas
      if (tags.length > 0) {
        const courseTagsData = tags.map((tagId) => ({
          course_id: params.courseId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("course_tags").insert(courseTagsData)

        if (tagsError) {
          console.error("Error asociando nuevas etiquetas:", tagsError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Curso actualizado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error en PUT de curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { courseId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Primero eliminar las lecciones del curso
    const { error: lessonsError } = await supabase.from("lessons").delete().eq("course_id", params.courseId)

    if (lessonsError) {
      console.error("Error eliminando lecciones:", lessonsError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando lecciones del curso",
          error: lessonsError,
        },
        { status: 500 },
      )
    }

    // Eliminar las asociaciones de etiquetas
    const { error: tagsError } = await supabase.from("course_tags").delete().eq("course_id", params.courseId)

    if (tagsError) {
      console.error("Error eliminando etiquetas del curso:", tagsError)
    }

    // Finalmente eliminar el curso
    const { error: courseError } = await supabase.from("courses").delete().eq("id", params.courseId)

    if (courseError) {
      console.error("Error eliminando curso:", courseError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando curso",
          error: courseError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error en DELETE de curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
