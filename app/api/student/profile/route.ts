import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest) {
  try {
    // Obtener usuario de la cookie
    const userSession = req.cookies.get("user-session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userData = JSON.parse(userSession)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener datos del formulario
    const formData = await req.formData()
    const firstName = formData.get("first_name") as string
    const lastName = formData.get("last_name") as string
    const email = formData.get("email") as string

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Actualizar usuario en la base de datos
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
    }

    // Actualizar cookie de sesión
    const updatedSession = {
      ...userData,
      first_name: firstName,
      last_name: lastName,
      email: email,
    }

    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        avatar_url: updatedUser.avatar_url,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
      },
    })

    // Actualizar cookie
    response.cookies.set("user-session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
    })

    return response
  } catch (error) {
    console.error("Error in profile update API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
