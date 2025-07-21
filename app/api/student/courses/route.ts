import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/student/courses - Iniciando...")

    // Verificar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Variables de entorno faltantes")
      return NextResponse.json(
        {
          success: false,
          error: "Configuración del servidor incompleta",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener cursos publicados con sus lecciones
    console.log("📚 Obteniendo cursos...")
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        instructor_name,
        difficulty_level,
        thumbnail_url,
        duration_hours,
        created_at,
        status,
        lessons:lessons(
          id,
          title,
          duration_minutes,
          is_free,
          order_index
        )
      `)
      .eq("status", "published")
      .neq("archived", true)
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("❌ Error obteniendo cursos:", coursesError)
      return NextResponse.json(
        {
          success: false,
          error: `Error obteniendo cursos: ${coursesError.message}`,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Procesar cursos para agregar información adicional
    const processedCourses = (courses || []).map((course) => {
      const lessons = course.lessons || []
      const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0)

      return {
        ...course,
        lessons: lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
        total_duration_minutes: totalDuration,
        total_lessons: lessons.length,
        instructor: course.instructor_name || "Instructor",
      }
    })

    console.log(`✅ Cursos obtenidos: ${processedCourses.length}`)

    return NextResponse.json(
      {
        success: true,
        courses: processedCourses,
        total: processedCourses.length,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )
  } catch (error: any) {
    console.error("❌ Error interno en GET /api/student/courses:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error interno del servidor: ${error.message}`,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
