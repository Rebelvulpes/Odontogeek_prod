import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos con lecciones, etiquetas y estadísticas
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(*),
        course_tags:course_tags(
          tag:course_tag(*)
        )
      `)
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({
        success: false,
        message: "Error obteniendo cursos: " + coursesError.message,
      })
    }

    // Obtener estadísticas de inscripciones por curso
    const { data: enrollmentStats, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id, user_id, amount")

    if (enrollmentError) {
      console.error("Error obteniendo inscripciones:", enrollmentError)
      return NextResponse.json({
        success: false,
        message: "Error obteniendo inscripciones: " + enrollmentError.message,
      })
    }

    // Procesar datos de cursos
    const processedCourses = courses?.map((course) => {
      // Contar estudiantes y calcular ingresos
      const courseEnrollments = enrollmentStats?.filter((e) => e.course_id === course.id) || []
      const students = courseEnrollments.length
      const revenue = courseEnrollments.reduce((sum, e) => sum + (e.amount || 0), 0)

      // Procesar etiquetas
      const tags = course.course_tags?.map((ct: any) => ct.tag).filter(Boolean) || []

      return {
        ...course,
        lessons: course.lessons || [],
        lessonsCount: course.lessons?.length || 0,
        tags,
        students,
        revenue,
      }
    })

    return NextResponse.json({
      success: true,
      data: processedCourses || [],
    })
  } catch (error) {
    console.error("Error en API de cursos admin:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { title, description, price, instructor, thumbnail_url, duration_hours, tags } = body

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: Number.parseFloat(price),
        instructor_name: instructor,
        thumbnail_url,
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        status: "draft",
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json({
        success: false,
        message: "Error creando curso: " + courseError.message,
      })
    }

    // Asociar etiquetas si se proporcionaron
    if (tags && tags.length > 0 && course) {
      const tagAssociations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tags").insert(tagAssociations)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar completamente, solo log el error
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Curso creado exitosamente",
    })
  } catch (error) {
    console.error("Error en POST de cursos admin:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
