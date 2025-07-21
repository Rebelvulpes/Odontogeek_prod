import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Verificar autenticación
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener información del usuario para verificar si es admin
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (userError) {
      console.error("Error obteniendo datos del usuario:", userError)
      return NextResponse.json({ error: "Error obteniendo datos del usuario" }, { status: 500 })
    }

    let coursesQuery

    if (userData.role === "admin") {
      // Los administradores ven todos los cursos
      coursesQuery = supabase
        .from("courses")
        .select(`
          *,
          course_tags (
            course_tag_definitions (
              id,
              name,
              color
            )
          )
        `)
        .eq("archived", false)
        .order("created_at", { ascending: false })
    } else {
      // Los estudiantes solo ven cursos en los que están inscritos
      coursesQuery = supabase
        .from("courses")
        .select(`
          *,
          enrollments!inner (
            id,
            enrolled_at,
            progress,
            completed_at
          ),
          course_tags (
            course_tag_definitions (
              id,
              name,
              color
            )
          )
        `)
        .eq("enrollments.user_id", userId)
        .eq("enrollments.status", "active")
        .eq("archived", false)
        .order("created_at", { ascending: false })
    }

    const { data: courses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return NextResponse.json({ error: "Error obteniendo cursos" }, { status: 500 })
    }

    // Formatear los datos para incluir información de inscripción
    const formattedCourses = courses.map((course) => ({
      ...course,
      tags: course.course_tags?.map((ct) => ct.course_tag_definitions) || [],
      enrollment:
        userData.role === "admin"
          ? {
              id: "admin-access",
              enrolled_at: new Date().toISOString(),
              progress: 100,
              completed_at: null,
              status: "admin",
            }
          : course.enrollments?.[0] || null,
    }))

    // Registrar acceso para administradores
    if (userData.role === "admin") {
      await supabase.from("student_access_logs").insert({
        user_id: userId,
        course_id: null,
        lesson_id: null,
        access_type: "admin",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
    }

    return NextResponse.json({ courses: formattedCourses })
  } catch (error) {
    console.error("Error en /api/student/courses:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
