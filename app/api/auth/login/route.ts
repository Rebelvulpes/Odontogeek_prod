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

    console.log("User query result:", {
      user: user ? "found" : "not found",
      error: userError,
      hasPasswordHash: user?.password_hash ? "yes" : "no",
      passwordHashStart: user?.password_hash ? user.password_hash.substring(0, 10) : "none",
    })

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
    console.log("Input password:", password)
    console.log("Stored hash:", user.password_hash)

    // Probar tanto bcrypt como bcryptjs
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash)
      console.log("bcrypt.compare result:", passwordMatch)
    } catch (compareError) {
      console.error("Error comparing passwords:", compareError)
    }

    // Si no funciona, intentar generar un nuevo hash para comparar
    if (!passwordMatch) {
      console.log("Generating new hash for comparison...")
      const newHash = await bcrypt.hash(password, 10)
      console.log("New hash generated:", newHash)

      // Intentar con el hash que sabemos que funciona
      const testHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
      const testMatch = await bcrypt.compare(password, testHash)
      console.log("Test hash comparison:", testMatch)
    }

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
