import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Verificar variables de entorno
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const jwtSecret = process.env.JWT_SECRET

if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
  console.error("❌ Variables de entorno faltantes:", {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    jwtSecret: !!jwtSecret,
  })
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando proceso de login...")

    const body = await request.json()
    const { email, password } = body

    console.log("📧 Email recibido:", email)

    if (!email || !password) {
      console.log("❌ Email o contraseña faltantes")
      return NextResponse.json(
        { success: false, error: "Email y contraseña son requeridos" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )
    }

    // Buscar usuario en la base de datos
    console.log("🔍 Buscando usuario en la base de datos...")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ Usuario no encontrado:", userError?.message)
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )
    }

    console.log("👤 Usuario encontrado:", {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password_hash,
    })

    // Verificar contraseña
    if (!user.password_hash) {
      console.log("❌ Usuario sin contraseña configurada")
      return NextResponse.json(
        { success: false, error: "Usuario sin contraseña configurada" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log("🔐 Verificación de contraseña:", isValidPassword)

    if (!isValidPassword) {
      console.log("❌ Contraseña incorrecta")
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )
    }

    // Actualizar último login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    // Crear token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    console.log("🎫 Token JWT creado")

    // Preparar datos del usuario (sin contraseña)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    }

    console.log("✅ Login exitoso para:", email)

    // Crear respuesta con cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userData,
        message: "Login exitoso",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )

    // Configurar cookie segura
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("❌ Error en login:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )
  }
}
