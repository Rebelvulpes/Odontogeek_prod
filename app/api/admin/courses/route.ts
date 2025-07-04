import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Primero obtenemos los cursos con sus lecciones y etiquetas
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
        ),
        tags:course_tag_relations(
          course_tags(
            id,
            name,
            slug,
            color,
            description
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo cursos:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${error.message}`,
      })
    }

    // Ahora obtenemos las inscripciones por separado - manejo seguro
    const enrollmentsByCourse = new Map()
    try {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_id, amount_paid")

      if (!enrollmentsError && enrollments) {
        enrollments.forEach((enrollment) => {
          const courseId = enrollment.course_id
          if (!enrollmentsByCourse.has(courseId)) {
            enrollmentsByCourse.set(courseId, {
              count: 0,
              revenue: 0,
            })
          }
          const courseEnrollments = enrollmentsByCourse.get(courseId)
          courseEnrollments.count += 1
          courseEnrollments.revenue += enrollment.amount_paid || 0
        })
      } else if (enrollmentsError) {
        console.error("Error obteniendo inscripciones (tabla puede no existir):", enrollmentsError)
      }
    } catch (enrollmentError) {
      console.error("Tabla enrollments no existe o tiene problemas:", enrollmentError)
    }

    // Transformar los datos para que tengan la estructura correcta con datos reales
    const coursesWithStats = courses.map((course) => {
      const courseEnrollments = enrollmentsByCourse.get(course.id) || { count: 0, revenue: 0 }
      const lessonsCount = course.lessons?.filter((lesson) => !lesson.archived).length || 0

      return {
        ...course,
        tags: course.tags?.map((relation: any) => relation.course_tags).filter(Boolean) || [],
        lessonsCount: lessonsCount,
        students: courseEnrollments.count, // Número real de estudiantes inscritos
        revenue: courseEnrollments.revenue, // Ingresos reales basados en inscripciones
      }
    })

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
    })
  } catch (error) {
    console.error("Error interno en GET /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, price, instructor, duration_hours, thumbnailUrl, tags } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: Number.parseFloat(price),
        instructor_name: instructor, // Usar instructor_name en lugar de instructor
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        thumbnail_url: thumbnailUrl || null,
        status: "published",
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error creando curso: ${courseError.message}`,
      })
    }

    // Agregar etiquetas si se proporcionaron
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagRelations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("course_tag_relations").insert(tagRelations)

      if (tagError) {
        console.error("Error agregando etiquetas:", tagError)
        // No fallar la creación del curso por las etiquetas
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Curso creado exitosamente",
    })
  } catch (error) {
    console.error("Error interno en POST /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
