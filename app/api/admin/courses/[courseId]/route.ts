import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { courseId } = params

    const { title, description, price, instructor, thumbnail_url } = body

    // Validar campos requeridos
    if (!title || !description || !instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Los campos título, descripción e instructor son requeridos",
        },
        { status: 400 },
      )
    }

    // Actualizar el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price: Number.parseFloat(price) || 0,
        instructor_name: instructor,
        thumbnail_url: thumbnail_url || null,
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
          error: courseError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Curso actualizado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error en PUT curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { courseId } = params

    const { archived } = body

    // Actualizar el estado de archivado
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update({
        archived: archived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .select()
      .single()

    if (courseError) {
      console.error("Error archivando curso:", courseError)
      return NextResponse.json(
        {
          success: false,
          message: "Error archivando curso",
          error: courseError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: archived ? "Curso archivado exitosamente" : "Curso restaurado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error en PATCH curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    // Primero eliminar todas las lecciones del curso
    const { error: lessonsError } = await supabase.from("lessons").delete().eq("course_id", courseId)

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

    // Eliminar enrollments del curso
    const { error: enrollmentsError } = await supabase.from("enrollments").delete().eq("course_id", courseId)

    if (enrollmentsError) {
      console.error("Error eliminando enrollments:", enrollmentsError)
      // No fallar si no existe la tabla enrollments
    }

    // Finalmente eliminar el curso
    const { error: courseError } = await supabase.from("courses").delete().eq("id", courseId)

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
    console.error("Error en DELETE curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
