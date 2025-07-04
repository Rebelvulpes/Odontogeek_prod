import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener todos los cursos con sus lecciones y etiquetas
    const { data: courses, error: coursesError } = await supabase
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

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${coursesError.message}`,
      })
    }

    // Obtener etiquetas para cada curso
    const coursesWithTags = await Promise.all(
      (courses || []).map(async (course) => {
        const { data: courseTags } = await supabase
          .from("course_tag_relations")
          .select(`
            course_tags(
              id,
              name,
              slug,
              color
            )
          `)
          .eq("course_id", course.id)

        // Contar estudiantes y calcular ingresos
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        const revenue = (studentsCount || 0) * (course.price || 0)

        return {
          ...course,
          tags: courseTags?.map((relation) => relation.course_tags).filter(Boolean) || [],
          students: studentsCount || 0,
          revenue,
          lessonsCount: course.lessons?.length || 0,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: coursesWithTags,
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
    const { title, description, price, instructor, thumbnailUrl, duration_hours, tags } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear el curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: Number.parseFloat(price),
        instructor,
        thumbnail_url: thumbnailUrl || null,
        duration_hours: duration_hours || null,
        status: "published",
        archived: false,
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

    // Asociar etiquetas si se proporcionaron
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tag_relations").insert(tagRelations)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar completamente, solo advertir
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
