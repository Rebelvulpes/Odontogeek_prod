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

    // Verificar que el usuario aún existe en la base de datos
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, avatar_url, created_at, updated_at")
      .eq("id", userSession.id)
      .single()

    if (error || !user) {
      // Limpiar cookie si el usuario no existe
      const response = NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
      response.cookies.delete("user-session")
      return response
    }

    return NextResponse.json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error("Error getting user session:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
