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
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({
        success: false,
        message: "Email y contraseña son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar usuario por email
    console.log("=== SEARCHING USER ===")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("User found:", !!user)
    console.log("User error:", userError)

    if (user) {
      console.log("User details:")
      console.log("- ID:", user.id)
      console.log("- Email:", user.email)
      console.log("- Name:", user.first_name, user.last_name)
      console.log("- Role:", user.role)
      console.log("- Has password hash:", !!user.password_hash)
      console.log("- Hash length:", user.password_hash?.length)
      console.log("- Hash starts with:", user.password_hash?.substring(0, 10))
      console.log("- Full hash:", user.password_hash)
    }

    if (userError || !user) {
      console.log("❌ User not found")
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    if (!user.password_hash) {
      console.log("❌ No password hash stored")
      return NextResponse.json({
        success: false,
        message: "Usuario sin contraseña configurada",
      })
    }

    // Verificar contraseña
    console.log("=== PASSWORD VERIFICATION ===")
    console.log("Input password:", password)
    console.log("Stored hash:", user.password_hash)
    console.log("Hash algorithm:", user.password_hash.substring(0, 4))

    try {
      const passwordMatch = await bcrypt.compare(password, user.password_hash)
      console.log("bcrypt.compare result:", passwordMatch)

      if (!passwordMatch) {
        console.log("❌ Password does not match")

        // Debug: Generar nuevo hash para comparar
        console.log("=== DEBUG: Generating new hash ===")
        const newHash = await bcrypt.hash(password, 10)
        console.log("New hash for input password:", newHash)

        return NextResponse.json({
          success: false,
          message: "Credenciales inválidas",
        })
      }

      console.log("✅ Password match successful!")
    } catch (compareError) {
      console.error("❌ Error comparing passwords:", compareError)
      return NextResponse.json({
        success: false,
        message: "Error verificando credenciales",
      })
    }

    // Crear sesión
    const userSession = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at,
    }

    console.log("=== CREATING SESSION ===")
    console.log("Session data:", userSession)

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

    console.log("✅ Login successful for:", user.email)
    return response
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
