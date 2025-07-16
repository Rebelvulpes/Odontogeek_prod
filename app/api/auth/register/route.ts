import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json()

    console.log("Registration attempt:", { firstName, lastName, email, password: "***" })

    // Validaciones básicas
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Formato de email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("Existing user check:", { exists: !!existingUser, error: checkError })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Ya existe un usuario con este email",
      })
    }

    // Hash de la contraseña
    console.log("Hashing password...")
    const passwordHash = await bcrypt.hash(password, 10)
    console.log("Password hashed successfully")

    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: "student",
          is_test_user: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    console.log("User creation result:", { success: !createError, error: createError, user: newUser })

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({
        success: false,
        message: `Error creando usuario: ${createError.message}`,
      })
    }

    if (!newUser || newUser.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Error: No se pudo crear el usuario",
      })
    }

    const user = newUser[0]

    // Crear respuesta con cookie de sesión automática
    const response = NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      redirectTo: "/dashboard",
    })

    // Configurar cookie de sesión automática
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

    console.log("Registration successful for user:", user.email)
    return response
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
