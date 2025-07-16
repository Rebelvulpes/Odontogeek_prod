import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    console.log("=== REGISTRATION ATTEMPT ===")
    console.log("Email:", email)
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)
    console.log("Password length:", password?.length)

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      console.log("❌ Missing required fields")
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (password.length < 6) {
      console.log("❌ Password too short")
      return NextResponse.json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format")
      return NextResponse.json({
        success: false,
        message: "Formato de email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el usuario ya existe
    console.log("=== CHECKING EXISTING USER ===")
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("Existing user found:", !!existingUser)
    console.log("Check error:", checkError)

    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json({
        success: false,
        message: "Ya existe un usuario con este email",
      })
    }

    // Generar hash de la contraseña
    console.log("=== GENERATING PASSWORD HASH ===")
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log("Hash generated successfully")
    console.log("Hash length:", passwordHash.length)
    console.log("Hash preview:", passwordHash.substring(0, 20))
    console.log("Full hash:", passwordHash)

    // Crear nuevo usuario
    console.log("=== CREATING USER ===")
    const userData = {
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: "student",
      is_test_user: false,
      avatar_url: "/placeholder-user.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("User data to insert:", { ...userData, password_hash: "***" })

    const { data: newUser, error: createError } = await supabase.from("users").insert([userData]).select().single()

    console.log("User creation result:")
    console.log("- Success:", !createError)
    console.log("- Error:", createError)
    console.log("- User created:", !!newUser)

    if (createError) {
      console.error("❌ Error creating user:", createError)
      return NextResponse.json({
        success: false,
        message: `Error creando usuario: ${createError.message}`,
      })
    }

    if (!newUser) {
      console.log("❌ No user returned after creation")
      return NextResponse.json({
        success: false,
        message: "Error: No se pudo crear el usuario",
      })
    }

    console.log("✅ User created successfully:")
    console.log("- ID:", newUser.id)
    console.log("- Email:", newUser.email)
    console.log("- Name:", newUser.first_name, newUser.last_name)

    // Crear sesión automáticamente
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      created_at: newUser.created_at,
    }

    console.log("=== CREATING SESSION ===")
    console.log("Session data:", userSession)

    const response = NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
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

    console.log("✅ Registration successful")
    return response
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
