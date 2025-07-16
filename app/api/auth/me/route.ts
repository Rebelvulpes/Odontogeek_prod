import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET USER INFO ===")

    // Obtener cookie de sesión
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      console.log("❌ No session cookie found")
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
      console.log("Session data from cookie:", sessionData)
    } catch (parseError) {
      console.log("❌ Error parsing session cookie:", parseError)
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    if (!sessionData.id) {
      console.log("❌ No user ID in session")
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    // Verificar que el usuario aún existe en la base de datos
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, avatar_url, created_at")
      .eq("id", sessionData.id)
      .single()

    if (userError || !user) {
      console.log("❌ User not found in database:", userError)
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    console.log("✅ User info retrieved:", user.email)

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
      },
    })
  } catch (error) {
    console.error("❌ Error getting user info:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
