import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
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

    // Obtener el número de inscripciones por curso usando la tabla correcta "enrollments"
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("payment_status", "completed")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
      // No fallar si no hay inscripciones, solo usar 0
    }

    // Crear un mapa de inscripciones por curso
    const enrollmentsByCourse = new Map()
    if (enrollments) {
      enrollments.forEach((enrollment) => {
        enrollmentsByCourse.set(enrollment.course_id, (enrollmentsByCourse.get(enrollment.course_id) || 0) + 1)
      })
    }

    // Obtener etiquetas de cursos usando la relación correcta
    const { data: courseTags, error: courseTagsError } = await supabase.from("course_tags").select(`
        course_id,
        tags!course_tags_tag_id_fkey (
          id,
          name,
          color,
          slug
        )
      `)

    if (courseTagsError) {
      console.error("Error obteniendo etiquetas de cursos:", courseTagsError)
    }

    // Crear un mapa de etiquetas por curso
    const tagsByCourse = new Map()
    if (courseTags) {
      courseTags.forEach((ct) => {
        if (!tagsByCourse.has(ct.course_id)) {
          tagsByCourse.set(ct.course_id, [])
        }
        if (ct.tags) {
          tagsByCourse.get(ct.course_id).push(ct.tags)
        }
      })
    }

    // Procesar cursos y agregar datos calculados
    const processedCourses = courses.map((course) => {
      const studentCount = enrollmentsByCourse.get(course.id) || 0
      const revenue = studentCount * (course.price || 0)
      const lessonsCount = course.lessons ? course.lessons.filter((lesson) => !lesson.archived).length : 0

      return {
        ...course,
        tags: tagsByCourse.get(course.id) || [],
        students: studentCount,
        revenue: revenue,
        lessonsCount: lessonsCount,
        status: course.archived ? "archived" : "published",
      }
    })

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
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
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

    // Asociar etiquetas si se proporcionaron
    if (tags && tags.length > 0) {
      const courseTagsData = tags.map((tagId) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tags").insert(courseTagsData)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar por las etiquetas, el curso ya se creó
      }
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
        error: error.message,
      },
      { status: 500 },
    )
  }
}
