import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    const { data: course, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons (
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
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo curso",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Error en GET curso:", error)
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

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params
    const body = await request.json()

    const { data: course, error } = await supabase.from("courses").update(body).eq("id", courseId).select().single()

    if (error) {
      console.error("Error actualizando curso:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando curso",
          error: error,
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

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    // Primero eliminar las lecciones del curso
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

    // Eliminar las relaciones de etiquetas
    const { error: tagsError } = await supabase.from("course_tags").delete().eq("course_id", courseId)

    if (tagsError) {
      console.error("Error eliminando etiquetas del curso:", tagsError)
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
