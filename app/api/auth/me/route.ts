import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    // Obtener sesión de la cookie
    const userSession = req.cookies.get("user-session")?.value

    if (!userSession) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
        },
        { status: 401 },
      )
    }

    const userData = JSON.parse(userSession)

    // Verificar que el usuario aún existe en la base de datos
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user, error } = await supabase.from("users").select("*").eq("id", userData.id).single()

    if (error || !user) {
      // Limpiar cookie si el usuario no existe
      const response = NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        { status: 401 },
      )

      response.cookies.delete("user-session")
      return response
    }

    return NextResponse.json({
      success: true,
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
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
