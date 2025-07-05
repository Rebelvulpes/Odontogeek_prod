import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""
    const priceFilter = searchParams.get("price") || ""

    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from("courses")
      .select(`
        *,
        lessons (
          id,
          title,
          duration_minutes,
          is_free
        )
      `)
      .eq("status", "published")
      .eq("archived", false)

    // Aplicar filtros
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor_name.ilike.%${search}%`)
    }

    if (priceFilter === "free") {
      query = query.eq("price", 0)
    } else if (priceFilter === "paid") {
      query = query.gt("price", 0)
    }

    // Obtener cursos
    const {
      data: courses,
      error: coursesError,
      count: totalCourses,
    } = await query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({ success: false, message: "Error obteniendo cursos" }, { status: 500 })
    }

    // Obtener etiquetas para cada curso usando la relación correcta
    const coursesWithTags = await Promise.all(
      (courses || []).map(async (course) => {
        // Obtener etiquetas del curso
        const { data: courseTags, error: courseTagsError } = await supabase
          .from("course_tags")
          .select(`
            tags (
              id,
              name,
              color,
              slug
            )
          `)
          .eq("course_id", course.id)

        if (courseTagsError) {
          console.error(`Error obteniendo etiquetas para curso ${course.id}:`, courseTagsError)
        }

        // Obtener inscripciones reales para este curso
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("id")
          .eq("course_id", course.id)

        if (enrollmentsError) {
          console.error(`Error obteniendo inscripciones para curso ${course.id}:`, enrollmentsError)
        }

        // Procesar datos
        const tags = courseTags?.map((ct) => ct.tags).filter(Boolean) || []
        const studentsCount = enrollments?.length || 0
        const lessonsCount = course.lessons?.length || 0

        return {
          ...course,
          tags,
          students: studentsCount,
          lessonsCount,
        }
      }),
    )

    // Filtrar por etiqueta después de obtener las etiquetas
    let filteredCourses = coursesWithTags
    if (tag && tag !== "all") {
      filteredCourses = coursesWithTags.filter((course) => course.tags?.some((courseTag: any) => courseTag.id === tag))
    }

    // Calcular paginación
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
    console.error("Error en GET /api/courses:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
