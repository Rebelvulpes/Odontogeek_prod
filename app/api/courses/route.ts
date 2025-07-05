import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const tagsFilter = searchParams.get("tags") || ""

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Construir la consulta base
    let query = supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        duration_hours,
        thumbnail_url,
        created_at,
        status,
        instructor_name
      `)
      .eq("status", "published")
      .neq("archived", true)

    // Aplicar filtro de búsqueda si existe
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Obtener el total de cursos para paginación
    const { count: totalCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .neq("archived", true)

    // Aplicar paginación
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

    const { data: courses, error: coursesError } = await query

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${coursesError.message}`,
      })
    }

    // Procesar cada curso para obtener datos adicionales
    const coursesWithDetails = await Promise.all(
      (courses || []).map(async (course) => {
        // Obtener etiquetas del curso usando la relación correcta
        const { data: courseTags } = await supabase
          .from("course_tag_relations")
          .select(`
            course_tags!course_tag_relations_tag_id_fkey(
              id,
              name,
              slug,
              color
            )
          `)
          .eq("course_id", course.id)

        // Obtener lecciones del curso
        const { data: lessons } = await supabase
          .from("lessons")
          .select(`
            id,
            title,
            duration_minutes,
            is_free
          `)
          .eq("course_id", course.id)
          .neq("archived", true)
          .order("order_index", { ascending: true })

        // Obtener número de estudiantes inscritos
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          lessons: lessons || [],
          students_count: studentsCount || 0,
          tags: courseTags?.map((relation) => relation.course_tags).filter(Boolean) || [],
        }
      }),
    )

    // Filtrar por etiquetas si se especifica
    let filteredCourses = coursesWithDetails
    if (tagsFilter) {
      const tagSlugs = tagsFilter.split(",")
      filteredCourses = coursesWithDetails.filter((course) => course.tags.some((tag) => tagSlugs.includes(tag.slug)))
    }

    // Calcular información de paginación
    const totalPages = Math.ceil((totalCourses || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        courses: filteredCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses: totalCourses || 0,
          hasNextPage,
          hasPrevPage,
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
