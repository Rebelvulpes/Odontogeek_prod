import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "No token found",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar el token y obtener el usuario
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", token.value)
      .single()

    if (error || !user) {
      return NextResponse.json({
        success: false,
        message: "Invalid token",
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error verifying auth:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
