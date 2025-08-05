import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getCookieSettings, generateSessionData, validatePassword } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  try {
    console.log("=== REGISTRATION REQUEST START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Client IP:", clientIP)

    const body = await req.json()
    const { email, password, firstName, lastName } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, message: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Contraseña no válida",
          errors: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Formato de email inválido" }, { status: 400 })
    }

    // Connect to database
    const { createClient } = await import("@supabase/supabase-js")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ MISSING SUPABASE ENVIRONMENT VARIABLES")
      return NextResponse.json({ success: false, message: "Error de configuración del servidor" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim()
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", normalizedEmail).single()

    if (existingUser) {
      return NextResponse.json({ success: false, message: "El email ya está registrado" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: normalizedEmail,
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (createError || !newUser) {
      console.error("❌ USER CREATION FAILED:", createError)
      return NextResponse.json({ success: false, message: "Error al crear la cuenta" }, { status: 500 })
    }

    console.log("✅ USER CREATED SUCCESSFULLY:", newUser.id)

    // Generate session data with timestamp
    const sessionData = generateSessionData(newUser)

    // Create response
    const responseData = {
      success: true,
      message: "Cuenta creada exitosamente",
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
      redirectTo: "/dashboard",
    }

    const response = NextResponse.json(responseData)

    // Set secure session cookie with 7-day expiration
    const cookieSettings = getCookieSettings()
    response.cookies.set("user-session", JSON.stringify(sessionData), cookieSettings)

    const endTime = Date.now()
    console.log("✅ REGISTRATION SUCCESSFUL")
    console.log("Total processing time:", endTime - startTime, "ms")
    console.log("New user registered:", normalizedEmail)
    console.log("Session expires in:", cookieSettings.maxAge, "seconds (7 days)")

    return response
  } catch (error) {
    const endTime = Date.now()
    console.error("=== REGISTRATION ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
