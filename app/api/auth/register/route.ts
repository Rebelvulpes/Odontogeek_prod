import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  try {
    console.log("=== REGISTRATION ATTEMPT START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Client IP:", clientIP)

    const { email, password, firstName, lastName } = await req.json()

    console.log("=== REQUEST DATA ===")
    console.log("Email:", email)
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    // Validation
    if (!email || !password || !firstName || !lastName) {
      console.log("❌ VALIDATION FAILED: Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son requeridos",
          error: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      console.log("❌ VALIDATION FAILED: Password too short")
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
          error: "PASSWORD_TOO_SHORT",
        },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ VALIDATION FAILED: Invalid email format")
      return NextResponse.json(
        {
          success: false,
          message: "Formato de email inválido",
          error: "INVALID_EMAIL_FORMAT",
        },
        { status: 400 },
      )
    }

    console.log("=== DATABASE CONNECTION ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test database connection
    try {
      const { data: testConnection } = await supabase.from("users").select("count").limit(1)
      console.log("Database connection test:", testConnection ? "SUCCESS" : "FAILED")
    } catch (dbError) {
      console.error("❌ DATABASE CONNECTION FAILED:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Error de conexión a la base de datos",
          error: "DATABASE_CONNECTION_FAILED",
        },
        { status: 500 },
      )
    }

    // Check if user already exists
    console.log("=== CHECKING EXISTING USER ===")
    const normalizedEmail = email.toLowerCase().trim()
    console.log("Checking for email:", normalizedEmail)

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .single()

    console.log("Existing user check result:")
    console.log("- User found:", !!existingUser)
    console.log("- Check error:", checkError)

    if (existingUser) {
      console.log("❌ USER ALREADY EXISTS")
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un usuario con este email",
          error: "USER_ALREADY_EXISTS",
        },
        { status: 409 },
      )
    }

    // Generate password hash with multiple verification steps
    console.log("=== GENERATING PASSWORD HASH ===")
    const saltRounds = 10
    console.log("Salt rounds:", saltRounds)
    console.log("Password to hash length:", password.length)

    let passwordHash: string
    let hashVerified = false
    let attempts = 0
    const maxAttempts = 3

    while (!hashVerified && attempts < maxAttempts) {
      attempts++
      console.log(`Hash generation attempt ${attempts}/${maxAttempts}`)

      try {
        const hashStart = Date.now()
        passwordHash = await bcrypt.hash(password, saltRounds)
        const hashEnd = Date.now()

        console.log("Hash generation completed in:", hashEnd - hashStart, "ms")
        console.log("Hash generated successfully")
        console.log("Hash length:", passwordHash.length)
        console.log("Hash algorithm:", passwordHash.substring(0, 4))
        console.log("Hash preview:", passwordHash.substring(0, 30))
        console.log("Full hash:", passwordHash)

        // Verify the hash immediately with multiple verification attempts
        let verifyAttempts = 0
        let verifySuccess = false

        while (!verifySuccess && verifyAttempts < 3) {
          verifyAttempts++
          console.log(`Hash verification attempt ${verifyAttempts}/3`)

          try {
            const verifyResult = await bcrypt.compare(password, passwordHash)
            console.log(`Hash verification attempt ${verifyAttempts} result:`, verifyResult)

            if (verifyResult) {
              hashVerified = true
              verifySuccess = true
              console.log("✅ HASH VERIFICATION SUCCESSFUL")
            } else {
              console.log(`❌ Hash verification failed on attempt ${verifyAttempts}`)
            }
          } catch (verifyError) {
            console.error(`❌ Hash verification error on attempt ${verifyAttempts}:`, verifyError)
          }
        }

        if (!hashVerified) {
          console.log(`❌ Hash verification failed after ${verifyAttempts} attempts, retrying hash generation`)
          continue
        }
      } catch (hashError) {
        console.error(`❌ HASH GENERATION ERROR on attempt ${attempts}:`, hashError)
        if (attempts === maxAttempts) {
          return NextResponse.json(
            {
              success: false,
              message: "Error procesando contraseña",
              error: "HASH_GENERATION_ERROR",
            },
            { status: 500 },
          )
        }
      }
    }

    if (!hashVerified) {
      console.error("❌ FAILED TO GENERATE VERIFIED HASH AFTER ALL ATTEMPTS")
      return NextResponse.json(
        {
          success: false,
          message: "Error generando hash de contraseña seguro",
          error: "HASH_VERIFICATION_FAILED",
        },
        { status: 500 },
      )
    }

    // Create user data
    const userData = {
      email: normalizedEmail,
      password_hash: passwordHash!,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: "student",
      is_test_user: false,
      avatar_url: "/placeholder-user.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("=== CREATING USER ===")
    console.log("User data to insert:", {
      ...userData,
      password_hash: `${passwordHash!.substring(0, 20)}...`,
    })

    const { data: newUser, error: createError } = await supabase.from("users").insert([userData]).select().single()

    console.log("=== USER CREATION RESULT ===")
    console.log("Success:", !createError)
    console.log("Error:", createError)
    console.log("User created:", !!newUser)

    if (createError) {
      console.error("❌ USER CREATION ERROR:", createError)
      return NextResponse.json(
        {
          success: false,
          message: `Error creando usuario: ${createError.message}`,
          error: "USER_CREATION_FAILED",
        },
        { status: 500 },
      )
    }

    if (!newUser) {
      console.log("❌ NO USER RETURNED AFTER CREATION")
      return NextResponse.json(
        {
          success: false,
          message: "Error: No se pudo crear el usuario",
          error: "NO_USER_RETURNED",
        },
        { status: 500 },
      )
    }

    console.log("✅ USER CREATED SUCCESSFULLY")
    console.log("New user details:")
    console.log("- ID:", newUser.id)
    console.log("- Email:", newUser.email)
    console.log("- Name:", newUser.first_name, newUser.last_name)
    console.log("- Role:", newUser.role)

    // Verify the user can login immediately after creation
    console.log("=== POST-CREATION LOGIN VERIFICATION ===")
    try {
      const loginVerification = await bcrypt.compare(password, newUser.password_hash)
      console.log("Post-creation login verification:", loginVerification)

      if (!loginVerification) {
        console.error("❌ POST-CREATION LOGIN VERIFICATION FAILED")
        // Try to fix the user immediately
        const fixHash = await bcrypt.hash(password, 10)
        await supabase.from("users").update({ password_hash: fixHash }).eq("id", newUser.id)
        console.log("🔄 User hash fixed immediately after creation")
      }
    } catch (verifyError) {
      console.error("❌ POST-CREATION VERIFICATION ERROR:", verifyError)
    }

    // Log successful registration
    try {
      await supabase.from("auth_debug_log").insert([
        {
          email: newUser.email,
          action: "registration_success",
          success: true,
          error_message: "User registered successfully",
          hash_preview: newUser.password_hash?.substring(0, 20),
        },
      ])
    } catch (logError) {
      console.error("Failed to log registration:", logError)
    }

    // Create session automatically
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      avatar_url: newUser.avatar_url,
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

    // Set session cookie
    const cookieValue = JSON.stringify(userSession)
    console.log("Setting cookie with value length:", cookieValue.length)

    response.cookies.set("user-session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    const endTime = Date.now()
    console.log("=== REGISTRATION SUCCESS ===")
    console.log("Total processing time:", endTime - startTime, "ms")
    console.log("User registered:", newUser.email)

    return response
  } catch (error) {
    const endTime = Date.now()
    console.error("=== REGISTRATION ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
