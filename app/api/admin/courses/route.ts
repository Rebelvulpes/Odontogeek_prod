import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Usar la función personalizada para obtener cursos con etiquetas
    const { data: courses, error: coursesError } = await supabase.rpc("get_courses_with_tags", {
      p_limit: 100, // Límite alto para admin
      p_offset: 0,
      p_tag_slugs: null,
      p_search: null,
    })

    if (coursesError) {
      return NextResponse.json({
        success: false,
        message: `Error obteniendo cursos: ${coursesError.message}`,
      })
    }

    // Obtener datos adicionales para cada curso
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Obtener ingresos totales
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("course_id", course.id)
          .eq("status", "completed")

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        return {
          ...course,
          revenue: totalRevenue,
          lessonsCount: course.lessons_count || 0,
          students: course.students_count || 0,
        }
      }),
    )

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
    const { title, description, price, instructor, duration_hours, tags } = await req.json()

    if (!title || !description || !price || !instructor) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear el curso
    const { data: newCourse, error: createError } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price),
          instructor_id: null, // Por ahora sin instructor específico
          duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
          status: "draft",
        },
      ])
      .select()

    if (createError) {
      return NextResponse.json({
        success: false,
        message: `Error creando curso: ${createError.message}`,
      })
    }

    const courseId = newCourse[0].id

    // Asociar etiquetas si se proporcionaron
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId: string) => ({
        course_id: courseId,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tag_relations").insert(tagRelations)

      if (tagsError) {
        console.error("Error asociando etiquetas:", tagsError)
        // No fallar por esto, solo registrar el error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      data: newCourse[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
