import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userData = JSON.parse(userSession)
    const userId = userData.id

    const { first_name, last_name, email } = await req.json()

    console.log("Updating profile for user:", userId, { first_name, last_name, email })

    if (!first_name || !last_name || !email) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe en otro usuario
    if (email !== userData.email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .neq("id", userId)
        .single()

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "Ya existe otro usuario con este email",
        })
      }
    }

    // Actualizar usuario
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    console.log("Profile update result:", { success: !updateError, error: updateError })

    if (updateError) {
      return NextResponse.json({
        success: false,
        message: `Error actualizando perfil: ${updateError.message}`,
      })
    }

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No se pudo actualizar el perfil",
      })
    }

    const user = updatedUser[0]

    // Crear respuesta y actualizar cookie
    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    })

    // Actualizar cookie de sesión con nueva información
    response.cookies.set(
      "user-session",
      JSON.stringify({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: "/",
      },
    )

    return response
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
