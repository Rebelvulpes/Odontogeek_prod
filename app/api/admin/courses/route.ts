import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Obtener cursos con sus lecciones y etiquetas
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        *,
        lessons (
          id,
          title,
          duration_minutes,
          is_free,
          order_index
        )
      `)
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({ success: false, message: "Error obteniendo cursos" }, { status: 500 })
    }

    // Obtener etiquetas para cada curso
    const { data: courseTags, error: courseTagsError } = await supabase.from("course_tags").select(`
        course_id,
        tag_id,
        tags (
          id,
          name,
          color,
          slug
        )
      `)

    if (courseTagsError) {
      console.error("Error obteniendo etiquetas de cursos:", courseTagsError)
    }

    // Obtener inscripciones reales (debería ser 0)
    const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("course_id")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    // Procesar datos
    const processedCourses =
      courses?.map((course) => {
        // Obtener etiquetas del curso
        const courseTagsList = courseTags?.filter((ct) => ct.course_id === course.id) || []
        const tags = courseTagsList.map((ct) => ct.tags).filter(Boolean)

        // Contar inscripciones reales para este curso
        const courseEnrollments = enrollments?.filter((e) => e.course_id === course.id) || []
        const studentsCount = courseEnrollments.length

        // Calcular ingresos reales
        const revenue = studentsCount * (course.price || 0)

        // Calcular duración total del curso
        const totalDuration =
          course.lessons?.reduce((sum: number, lesson: any) => {
            return sum + (lesson.duration_minutes || 0)
          }, 0) || 0

        return {
          ...course,
          tags,
          students: studentsCount, // Número real de estudiantes
          revenue, // Ingresos reales
          lessonsCount: course.lessons?.length || 0,
          duration_hours: Math.round((totalDuration / 60) * 10) / 10, // Convertir a horas con 1 decimal
          // Mantener las lecciones para compatibilidad
          lessons: course.lessons || [],
        }
      }) || []

    return NextResponse.json({
      success: true,
      data: processedCourses,
      message: "Cursos obtenidos correctamente con datos reales",
    })
  } catch (error) {
    console.error("Error en GET /api/admin/courses:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, price, instructor_name, thumbnail_url, status = "draft", tags = [] } = body

    // Validaciones básicas
    if (!title || !description) {
      return NextResponse.json({ success: false, message: "Título y descripción son requeridos" }, { status: 400 })
    }

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: price || 0,
        instructor_name: instructor_name || "Por asignar",
        thumbnail_url,
        status,
        archived: false,
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json({ success: false, message: "Error creando curso" }, { status: 500 })
    }

    // Asociar etiquetas si se proporcionaron
    if (tags.length > 0 && course) {
      const courseTagsData = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tags").insert(courseTagsData)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar por esto, solo log
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Curso creado exitosamente",
    })
  } catch (error) {
    console.error("Error en POST /api/admin/courses:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
