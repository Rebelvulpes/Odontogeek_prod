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

    // Validar datos requeridos
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
      return NextResponse.json({ error: "Error al actualizar el perfil" }, { status: 500 })
    }

    // Actualizar cookie de sesión con los nuevos datos
    const updatedUserData = {
      ...userData,
      first_name: firstName,
      last_name: lastName,
      email: email,
    }

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
    })

    // Actualizar cookie
    response.cookies.set("user-session", JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in student profile update:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
