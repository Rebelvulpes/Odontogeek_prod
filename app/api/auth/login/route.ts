import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log("Login attempt:", { email, password: "***" })

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email y contraseña son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar usuario por email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("User query result:", { user: user ? "found" : "not found", error: userError })

    if (userError || !user) {
      console.log("User not found or error:", userError)
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Verificar contraseña
    if (!user.password_hash) {
      console.log("No password hash found for user")
      return NextResponse.json({
        success: false,
        message: "Usuario no tiene contraseña configurada",
      })
    }

    console.log("Comparing passwords...")
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Log de auditoría para admins
    if (user.role === "admin") {
      try {
        await supabase.from("admin_logs").insert([
          {
            admin_id: user.id,
            action: "login",
            details: `Administrador ${user.first_name} ${user.last_name} inició sesión`,
            ip_address: req.headers.get("x-forwarded-for") || "unknown",
          },
        ])
      } catch (logError) {
        console.log("No se pudo crear log:", logError)
      }
    }

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
    })

    // Configurar cookie de sesión
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

    console.log("Login successful for user:", user.email)
    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
