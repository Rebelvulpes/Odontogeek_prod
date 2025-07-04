import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const body = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Actualizar el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update(body)
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
    const { count: enrollmentsCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)

    if (enrollmentsCount && enrollmentsCount > 0) {
      return NextResponse.json({
        success: false,
        message: `No se puede eliminar el curso porque tiene ${enrollmentsCount} estudiantes inscritos. Considera archivarlo en su lugar.`,
      })
    }

    // Eliminar relaciones de etiquetas primero
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
      message: "Curso eliminado exitosamente junto con todas sus lecciones",
    })
  } catch (error) {
    console.error("Error interno en DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
