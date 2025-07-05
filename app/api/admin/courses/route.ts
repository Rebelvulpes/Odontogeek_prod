import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos con sus lecciones
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        lessons:lessons(
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
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo cursos:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${error.message}`,
        data: [],
      })
    }

    // Obtener relaciones de etiquetas por separado - CORREGIDO
    const { data: tagRelations, error: tagRelationsError } = await supabase.from("course_tag_relations").select(`
        course_id,
        tag_id,
        course_tags!course_tag_relations_tag_id_fkey(
          id,
          name,
          color,
          slug,
          description
        )
      `)

    let tagsByCourse = {}
    if (!tagRelationsError && tagRelations) {
      tagsByCourse = tagRelations.reduce((acc, relation) => {
        if (!acc[relation.course_id]) {
          acc[relation.course_id] = []
        }
        if (relation.course_tags) {
          acc[relation.course_id].push(relation.course_tags)
        }
        return acc
      }, {})
    } else if (tagRelationsError) {
      console.error("Error obteniendo etiquetas:", tagRelationsError)
      // Continuar sin etiquetas si hay error
      tagsByCourse = {}
    }

    // Obtener inscripciones reales (solo si existen)
    let enrollmentStats = {}
    try {
      const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("course_id")

      if (!enrollmentsError && enrollments && enrollments.length > 0) {
        // Solo contar si hay inscripciones reales
        enrollmentStats = enrollments.reduce((acc, enrollment) => {
          const courseId = enrollment.course_id
          acc[courseId] = (acc[courseId] || 0) + 1
          return acc
        }, {})
      } else {
        // No hay inscripciones, todos los cursos tienen 0 estudiantes
        enrollmentStats = {}
      }
    } catch (enrollmentError) {
      console.error("Error obteniendo inscripciones:", enrollmentError)
      enrollmentStats = {}
    }

    // Procesar los datos para el frontend
    const processedCourses =
      courses?.map((course) => {
        // Filtrar lecciones no archivadas
        const activeLessons = course.lessons?.filter((lesson) => !lesson.archived) || []

        // Obtener etiquetas para este curso
        const courseTags = tagsByCourse[course.id] || []

        // Calcular estadísticas REALES (sin datos falsos)
        const enrollmentCount = enrollmentStats[course.id] || 0 // 0 si no hay inscripciones reales
        const revenue = enrollmentCount * (course.price || 0) // 0 si no hay estudiantes

        return {
          ...course,
          lessons: activeLessons,
          lessonsCount: activeLessons.length,
          tags: courseTags,
          students: enrollmentCount, // Número real de estudiantes (0 si no hay inscripciones)
          revenue: revenue, // Ingresos reales (0 si no hay estudiantes)
        }
      }) || []

    return NextResponse.json({
      success: true,
      data: processedCourses,
    })
  } catch (error) {
    console.error("Error interno en GET /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
      data: [],
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { title, description, price, instructor, thumbnailUrl, duration_hours, tags } = body

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price),
          instructor_name: instructor,
          thumbnail_url: thumbnailUrl,
          duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
          status: "published",
          archived: false,
        },
      ])
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error creando curso: ${courseError.message}`,
      })
    }

    // Asociar etiquetas si se proporcionaron
    if (tags && tags.length > 0 && course) {
      const tagAssociations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tag_relations").insert(tagAssociations)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar por esto, solo logear
      }
    }

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error interno en POST /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
