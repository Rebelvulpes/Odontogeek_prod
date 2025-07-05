import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener todos los cursos con lecciones
    const { data: courses, error: coursesError } = await supabase
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
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo cursos",
          error: coursesError,
        },
        { status: 500 },
      )
    }

    // Obtener el número de inscripciones por curso (sin filtro de payment_status por ahora)
    const { data: enrollments, error: enrollmentsError } = await supabase.from("enrollments").select("course_id")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
    }

    // Crear un mapa de inscripciones por curso
    const enrollmentsByCourse = new Map()
    if (enrollments) {
      enrollments.forEach((enrollment) => {
        const courseId = enrollment.course_id
        if (!enrollmentsByCourse.has(courseId)) {
          enrollmentsByCourse.set(courseId, { count: 0, revenue: 0 })
        }
        const current = enrollmentsByCourse.get(courseId)
        current.count += 1
      })
    }

    // Procesar cursos y agregar datos calculados
    const processedCourses =
      courses?.map((course) => {
        const enrollmentData = enrollmentsByCourse.get(course.id) || { count: 0, revenue: 0 }
        // Calcular revenue basado en el precio del curso y número de estudiantes
        const revenue = enrollmentData.count * (course.price || 0)
        const lessonsCount = course.lessons ? course.lessons.filter((lesson) => !lesson.archived).length : 0

        return {
          ...course,
          tags: [],
          students: enrollmentData.count,
          revenue: revenue,
          lessonsCount: lessonsCount,
          status: course.archived ? "archived" : "published",
        }
      }) || []

    return NextResponse.json({
      success: true,
      data: processedCourses,
    })
  } catch (error) {
    console.error("Error en la ruta de cursos admin:", error)
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
        status: "published",
        archived: false,
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creando curso:", courseError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando curso",
          error: courseError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      data: course,
    })
  } catch (error) {
    console.error("Error en POST de cursos admin:", error)
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
