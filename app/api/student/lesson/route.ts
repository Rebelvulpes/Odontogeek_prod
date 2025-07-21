import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return NextResponse.json({ error: "ID de lección requerido" }, { status: 400 })
    }

    // Verificar autenticación
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (userError) {
      console.error("Error obteniendo datos del usuario:", userError)
      return NextResponse.json({ error: "Error obteniendo datos del usuario" }, { status: 500 })
    }

    // Obtener información de la lección
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        *,
        courses (
          id,
          title,
          price
        )
      `)
      .eq("id", lessonId)
      .single()

    if (lessonError || !lesson) {
      console.error("Error obteniendo lección:", lessonError)
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 })
    }

    let hasAccess = false
    let accessType = "denied"

    // Verificar acceso
    if (userData.role === "admin") {
      // Los administradores tienen acceso a todo
      hasAccess = true
      accessType = "admin"
    } else if (lesson.is_free) {
      // Las lecciones gratuitas son accesibles para usuarios con cuenta
      hasAccess = true
      accessType = "free"
    } else {
      // Verificar si el usuario está inscrito en el curso
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", userId)
        .eq("course_id", lesson.course_id)
        .eq("status", "active")
        .single()

      if (!enrollmentError && enrollment) {
        hasAccess = true
        accessType = "enrolled"
      }
    }

    // Registrar el intento de acceso
    await supabase.from("student_access_logs").insert({
      user_id: userId,
      course_id: lesson.course_id,
      lesson_id: lessonId,
      access_type: accessType,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Acceso denegado",
          message: "Necesitas estar inscrito en este curso para acceder a esta lección",
        },
        { status: 403 },
      )
    }

    return NextResponse.json({
      lesson,
      accessType,
      hasAccess: true,
    })
  } catch (error) {
    console.error("Error en /api/student/lesson:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
