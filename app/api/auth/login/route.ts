import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Password length:", password?.length)

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

    console.log("=== USER QUERY RESULT ===")
    console.log("User found:", !!user)
    console.log("User error:", userError)

    if (user) {
      console.log("User ID:", user.id)
      console.log("User email:", user.email)
      console.log("User role:", user.role)
      console.log("Has password hash:", !!user.password_hash)
      console.log("Hash length:", user.password_hash?.length)
      console.log("Hash preview:", user.password_hash?.substring(0, 20))
    }

    if (userError || !user) {
      console.log("❌ User not found or error:", userError)
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Verificar contraseña
    if (!user.password_hash) {
      console.log("❌ No password hash found for user")
      return NextResponse.json({
        success: false,
        message: "Usuario no tiene contraseña configurada",
      })
    }

    console.log("=== PASSWORD COMPARISON ===")
    console.log("Input password:", password)
    console.log("Stored hash:", user.password_hash)

    // Verificar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("Password match result:", passwordMatch)

    // Si no coincide, intentar generar un nuevo hash para debug
    if (!passwordMatch) {
      console.log("=== DEBUG: GENERATING NEW HASH ===")
      const newHash = await bcrypt.hash(password, 10)
      console.log("New hash for comparison:", newHash)

      // Probar con hash conocido que funciona
      const testHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC"
      const testMatch = await bcrypt.compare(password, testHash)
      console.log("Test with known good hash:", testMatch)

      console.log("❌ Password does not match")
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    console.log("✅ Password match successful!")

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
        console.log("Could not create admin log:", logError)
      }
    }

    // Crear respuesta con cookie de sesión
    const userSession = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at,
    }

    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: userSession,
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
    })

    // Configurar cookie de sesión
    response.cookies.set("user-session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    console.log("✅ Login successful for user:", user.email)
    return response
  } catch (error) {
    console.error("❌ Error en login:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
