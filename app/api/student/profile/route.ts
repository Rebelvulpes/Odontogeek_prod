import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    const userSession = JSON.parse(sessionCookie.value)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener información completa del perfil
    const { data: user, error } = await supabase.from("users").select("*").eq("id", userSession.id).single()

    if (error || !user) {
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Obtener estadísticas del estudiante
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, progress, completed_at")
      .eq("user_id", userSession.id)

    const stats = {
      totalCourses: enrollments?.length || 0,
      completedCourses: enrollments?.filter((e) => e.completed_at).length || 0,
      averageProgress: enrollments?.length
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0,
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      stats,
    })
  } catch (error) {
    console.error("Error getting profile:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    const userSession = JSON.parse(sessionCookie.value)
    const { firstName, lastName, email } = await req.json()

    // Validaciones
    if (!firstName || !lastName || !email) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe (excepto el usuario actual)
    if (email.toLowerCase() !== userSession.email.toLowerCase()) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", userSession.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "Este email ya está en uso",
        })
      }
    }

    // Actualizar usuario
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userSession.id)
      .select()
      .single()

    if (error || !updatedUser) {
      console.error("Error updating profile:", error)
      return NextResponse.json({
        success: false,
        message: "Error al actualizar perfil",
      })
    }

    // Actualizar cookie de sesión
    const newSession = {
      ...userSession,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
    }

    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    })

    response.cookies.set("user-session", JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
