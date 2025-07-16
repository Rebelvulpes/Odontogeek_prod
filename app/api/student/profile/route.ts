import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const userData = JSON.parse(userSession)
    const { first_name, last_name, email } = await req.json()

    // Validaciones básicas
    if (!first_name || !last_name || !email) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Formato de email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe (excepto para el usuario actual)
    if (email.toLowerCase().trim() !== userData.email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .neq("id", userData.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "Ya existe otro usuario con este email",
        })
      }
    }

    // Actualizar usuario
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id)
      .select()

    if (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json({
        success: false,
        message: "Error actualizando perfil",
      })
    }

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    const user = updatedUser[0]

    // Actualizar cookie de sesión
    const newUserSession = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at,
    }

    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })

    // Actualizar cookie
    response.cookies.set("user-session", JSON.stringify(newUserSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in student profile API:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
