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
        lessons:lessons(*)
      `)
      .eq("id", params.courseId)
      .single()

    if (error) {
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
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { title, description, price, instructor, duration_hours, status } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price: Number.parseFloat(price),
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        status,
      })
      .eq("id", params.courseId)
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error actualizando curso: ${error.message}`,
      })
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

    const { error } = await supabase.from("courses").delete().eq("id", params.courseId)

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error eliminando curso: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
