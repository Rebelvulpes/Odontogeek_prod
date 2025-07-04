import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const search = searchParams.get("search") || ""

    const offset = (page - 1) * limit

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Construir la consulta base
    let coursesQuery = supabase
      .from("courses")
      .select(`
        *,
        course_tag_relations!inner(
          course_tags(*)
        ),
        lessons:lessons(count),
        enrollments:enrollments(count)
      `)
      .eq("status", "published")
      .eq("archived", false)

    // Aplicar filtro de búsqueda si existe
    if (search) {
      coursesQuery = coursesQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Si hay filtros de tags, necesitamos una consulta diferente
    if (tags.length > 0) {
      // Primero obtener los IDs de cursos que tienen las etiquetas seleccionadas
      const { data: courseIds, error: tagsError } = await supabase
        .from("course_tag_relations")
        .select(`
          course_id,
          course_tags!inner(slug)
        `)
        .in("course_tags.slug", tags)

      if (tagsError) {
        console.error("Error obteniendo cursos por tags:", tagsError)
        return NextResponse.json({
          success: false,
          message: `Error filtrando por etiquetas: ${tagsError.message}`,
        })
      }

      const uniqueCourseIds = [...new Set(courseIds?.map((item) => item.course_id) || [])]

      if (uniqueCourseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            courses: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalCourses: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        })
      }

      coursesQuery = coursesQuery.in("id", uniqueCourseIds)
    }

    // Obtener el total de cursos para paginación
    const { count: totalCourses, error: countError } = await coursesQuery

    if (countError) {
      console.error("Error contando cursos:", countError)
    }

    // Aplicar paginación y obtener los cursos
    const { data: coursesData, error: coursesError } = await coursesQuery
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${coursesError.message}`,
      })
    }

    // Procesar los datos para obtener las etiquetas y estadísticas de cada curso
    const processedCourses = await Promise.all(
      (coursesData || []).map(async (course) => {
        // Obtener todas las etiquetas del curso
        const { data: courseTags } = await supabase
          .from("course_tag_relations")
          .select(`
            course_tags(*)
          `)
          .eq("course_id", course.id)

        // Obtener conteo de lecciones
        const { count: lessonsCount } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Obtener conteo de estudiantes
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          duration_hours: course.duration_hours,
          created_at: course.created_at,
          lessons_count: lessonsCount || 0,
          students_count: studentsCount || 0,
          tags: courseTags?.map((relation) => relation.course_tags).filter(Boolean) || [],
        }
      }),
    )

    const totalPages = Math.ceil((totalCourses || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        courses: processedCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses: totalCourses || 0,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Error interno en GET /api/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
