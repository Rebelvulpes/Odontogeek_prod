import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Obtener todos los cursos
    const { data: courses, error: coursesError } = await supabase.from("courses").select("*")

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({ error: "Error fetching courses" }, { status: 500 })
    }

    // Obtener el número de inscripciones por curso
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .order("course_id")

    if (enrollmentsError) {
      console.error("Error obteniendo inscripciones:", enrollmentsError)
      return NextResponse.json({ error: "Error fetching enrollments" }, { status: 500 })
    }

    // Crear un mapa de inscripciones por curso
    const enrollmentsByCourse = new Map()
    enrollments?.forEach((enrollment) => {
      enrollmentsByCourse.set(enrollment.course_id, (enrollmentsByCourse.get(enrollment.course_id) || 0) + 1)
    })

    const { data: lessons, error: lessonsError } = await supabase.from("lessons").select("course_id").order("course_id")

    if (lessonsError) {
      console.error("Error obteniendo lecciones:", lessonsError)
      return NextResponse.json({ error: "Error fetching lessons" }, { status: 500 })
    }

    // Crear un mapa de lecciones por curso
    const lessonsByCourse = new Map()
    lessons?.forEach((lesson) => {
      lessonsByCourse.set(lesson.course_id, (lessonsByCourse.get(lesson.course_id) || 0) + 1)
    })

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

    // Procesar cursos y agregar etiquetas
    const processedCourses = courses.map((course) => ({
      ...course,
      tags: tagsByCourse.get(course.id) || [],
      students: enrollmentsByCourse.get(course.id) || 0,
      revenue: (enrollmentsByCourse.get(course.id) || 0) * (course.price || 0),
      lessonsCount: lessonsByCourse.get(course.id) || 0,
    }))

    return NextResponse.json(processedCourses)
  } catch (error) {
    console.error("Error en la ruta:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
