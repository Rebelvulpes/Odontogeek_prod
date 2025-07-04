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

    // Obtener cursos con la función personalizada
    const { data: courses, error: coursesError } = await supabase.rpc("get_courses_with_tags", {
      p_limit: limit,
      p_offset: offset,
      p_tag_slugs: tags.length > 0 ? tags : null,
      p_search: search || null,
    })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${coursesError.message}`,
      })
    }

    // Obtener el total de cursos para la paginación
    let totalQuery = supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("archived", false)

    if (search) {
      totalQuery = totalQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (tags.length > 0) {
      // Para el conteo con tags, necesitamos una consulta más compleja
      const { data: coursesWithTags } = await supabase
        .from("courses")
        .select(`
          id,
          course_tag_relations!inner(
            course_tags!inner(slug)
          )
        `)
        .eq("status", "published")
        .eq("archived", false)
        .in("course_tag_relations.course_tags.slug", tags)

      const uniqueCourseIds = [...new Set(coursesWithTags?.map((c) => c.id) || [])]
      totalQuery = supabase.from("courses").select("id", { count: "exact", head: true }).in("id", uniqueCourseIds)
    }

    const { count: totalCourses } = await totalQuery

    const totalPages = Math.ceil((totalCourses || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        courses: courses || [],
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
