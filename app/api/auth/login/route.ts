import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email y contraseña son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar usuario por email
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Verificar contraseña
    if (!user.password_hash) {
      return NextResponse.json({
        success: false,
        message: "Usuario no tiene contraseña configurada",
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Crear una sesión simple (sin JWT por ahora)
    const sessionId = crypto.randomUUID()

    // Log de auditoría para admins (intentar, pero no fallar si no existe la tabla)
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

    // Crear respuesta con cookie simple
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      },
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
    })

    // Configurar cookie simple con información del usuario
    response.cookies.set(
      "user-session",
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 días
      },
    )

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
