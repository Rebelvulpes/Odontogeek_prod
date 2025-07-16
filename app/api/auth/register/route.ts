import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    console.log("=== REGISTER ATTEMPT ===")
    console.log("Email:", email)
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingUser) {
      console.log("❌ User already exists:", email)
      return NextResponse.json({
        success: false,
        message: "Este email ya está registrado",
      })
    }

    // Generar hash de la contraseña
    console.log("=== GENERATING PASSWORD HASH ===")
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log("Hash generated, length:", passwordHash.length)
    console.log("Hash preview:", passwordHash.substring(0, 20))

    // Crear nuevo usuario
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: "student",
          avatar_url: "/placeholder-user.jpg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (createError || !newUser) {
      console.error("❌ Error creating user:", createError)
      return NextResponse.json({
        success: false,
        message: "Error al crear la cuenta",
      })
    }

    console.log("✅ User created successfully:", newUser.email)

    // Crear sesión automáticamente
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      created_at: newUser.created_at,
    }

    const response = NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: userSession,
      redirectTo: "/dashboard",
    })

    // Configurar cookie de sesión
    response.cookies.set("user-session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Error in register:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
