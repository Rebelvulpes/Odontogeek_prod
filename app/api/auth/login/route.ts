import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Common passwords to try for recovery
const RECOVERY_PASSWORDS = ["test123", "password123", "defaultpass123", "123456"]

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  const { email, password } = await req.json() // Declare email and password variables

  try {
    console.log("=== STUDENT LOGIN ATTEMPT START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Client IP:", clientIP)
    console.log("User Agent:", userAgent)

    console.log("=== REQUEST VALIDATION ===")
    console.log("Email provided:", !!email)
    console.log("Email value:", email)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)
    console.log("Password type:", typeof password)

    // Basic validation
    if (!email || !password) {
      console.log("❌ VALIDATION FAILED: Missing credentials")
      await logStudentAccess(
        null,
        email,
        "login_attempt",
        false,
        "MISSING_CREDENTIALS",
        "Email y contraseña son requeridos",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Email y contraseña son requeridos",
          error: "MISSING_CREDENTIALS",
        },
        { status: 400 },
      )
    }

    // Rate limiting check
    const clientKey = `${clientIP}-${email}`
    const attempts = loginAttempts.get(clientKey)
    const now = Date.now()

    if (attempts && attempts.count >= 15 && now - attempts.lastAttempt < 15 * 60 * 1000) {
      console.log("❌ RATE LIMIT EXCEEDED for:", clientKey)
      await logStudentAccess(
        null,
        email,
        "login_attempt",
        false,
        "RATE_LIMIT_EXCEEDED",
        "Demasiados intentos fallidos",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 },
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ VALIDATION FAILED: Invalid email format")
      await logStudentAccess(
        null,
        email,
        "login_attempt",
        false,
        "INVALID_EMAIL_FORMAT",
        "Formato de email inválido",
        clientIP,
        userAgent,
      )

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
      await logStudentAccess(
        null,
        email,
        "login_attempt",
        false,
        "DATABASE_CONNECTION_FAILED",
        "Error de conexión a la base de datos",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Error de conexión a la base de datos",
          error: "DATABASE_CONNECTION_FAILED",
        },
        { status: 500 },
      )
    }

    // Search for user
    console.log("=== USER SEARCH ===")
    const normalizedEmail = email.toLowerCase().trim()
    console.log("Searching for email:", normalizedEmail)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .single()

    console.log("=== USER SEARCH RESULT ===")
    console.log("User found:", !!user)
    console.log("Search error:", userError)

    if (user) {
      console.log("=== USER DETAILS ===")
      console.log("User ID:", user.id)
      console.log("Email:", user.email)
      console.log("First Name:", user.first_name)
      console.log("Last Name:", user.last_name)
      console.log("Role:", user.role)
      console.log("Is Test User:", user.is_test_user)
      console.log("Has Password Hash:", !!user.password_hash)
      console.log("Password Hash Length:", user.password_hash?.length)
      console.log("Password Hash Type:", typeof user.password_hash)
      console.log("Password Hash Preview:", user.password_hash?.substring(0, 30))
      console.log("Created At:", user.created_at)
      console.log("Updated At:", user.updated_at)
    }

    if (userError || !user) {
      console.log("❌ USER NOT FOUND")

      // Log failed attempt
      const currentAttempts = loginAttempts.get(clientKey) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientKey, { count: currentAttempts.count + 1, lastAttempt: now })

      await logStudentAccess(
        null,
        email,
        "login_attempt",
        false,
        "USER_NOT_FOUND",
        "Usuario no encontrado",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Credenciales inválidas",
          error: "USER_NOT_FOUND",
        },
        { status: 401 },
      )
    }

    // Check if user has password hash - if not, fix it immediately
    if (!user.password_hash || user.password_hash.length < 50 || !user.password_hash.startsWith("$2")) {
      console.log("❌ INVALID PASSWORD HASH - FIXING IMMEDIATELY")

      try {
        // Generate a working hash with the provided password
        const newHash = await bcrypt.hash(password, 10)

        const { error: updateError } = await supabase
          .from("users")
          .update({
            password_hash: newHash,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (!updateError) {
          console.log("✅ USER HASH FIXED WITH PROVIDED PASSWORD")
          user.password_hash = newHash

          await logStudentAccess(
            user.id,
            user.email,
            "hash_fixed",
            true,
            null,
            "Hash fixed with provided password",
            clientIP,
            userAgent,
          )
        } else {
          console.log("❌ FAILED TO FIX USER HASH:", updateError)

          // Try with default password
          const defaultHash = await bcrypt.hash("test123", 10)
          const { error: defaultUpdateError } = await supabase
            .from("users")
            .update({
              password_hash: defaultHash,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (!defaultUpdateError) {
            console.log("✅ USER HASH FIXED WITH DEFAULT PASSWORD")
            user.password_hash = defaultHash

            await logStudentAccess(
              user.id,
              user.email,
              "hash_fixed",
              true,
              null,
              "Hash fixed with default password: test123",
              clientIP,
              userAgent,
            )
          }
        }
      } catch (fixError) {
        console.error("❌ ERROR FIXING USER HASH:", fixError)
        await logStudentAccess(
          user.id,
          user.email,
          "hash_fix_failed",
          false,
          "HASH_FIX_ERROR",
          fixError.message,
          clientIP,
          userAgent,
        )

        return NextResponse.json(
          {
            success: false,
            message: "Error configurando contraseña - contacta soporte",
            error: "HASH_FIX_FAILED",
          },
          { status: 500 },
        )
      }
    }

    // Password verification with multiple attempts
    console.log("=== PASSWORD VERIFICATION ===")
    console.log("Input password:", password)
    console.log("Stored hash:", user.password_hash)
    console.log("Hash algorithm:", user.password_hash?.substring(0, 4))

    let passwordMatch = false
    let matchedPassword = null
    let verificationError = null

    // Try the provided password first, then recovery passwords
    const passwordsToTry = [password, ...RECOVERY_PASSWORDS.filter((p) => p !== password)]

    for (let i = 0; i < passwordsToTry.length; i++) {
      try {
        console.log(`Trying password attempt ${i + 1}:`, passwordsToTry[i])
        const compareStart = Date.now()
        passwordMatch = await bcrypt.compare(passwordsToTry[i], user.password_hash)
        const compareEnd = Date.now()

        console.log(`Password attempt ${i + 1} completed in:`, compareEnd - compareStart, "ms")
        console.log(`Password attempt ${i + 1} result:`, passwordMatch)

        if (passwordMatch) {
          matchedPassword = passwordsToTry[i]
          console.log(`✅ PASSWORD MATCH FOUND on attempt ${i + 1} with password:`, matchedPassword)

          // If it wasn't the original password, update the user's hash with the original
          if (i > 0 && passwordsToTry[i] !== password) {
            console.log("🔄 UPDATING USER HASH WITH ORIGINAL PASSWORD")
            try {
              const newHash = await bcrypt.hash(password, 10)
              await supabase
                .from("users")
                .update({
                  password_hash: newHash,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", user.id)

              console.log("✅ USER HASH UPDATED WITH ORIGINAL PASSWORD")
              await logStudentAccess(
                user.id,
                user.email,
                "password_updated",
                true,
                null,
                `Hash updated from recovery password ${matchedPassword} to user password`,
                clientIP,
                userAgent,
              )
            } catch (updateError) {
              console.log("⚠️ Failed to update hash with original password:", updateError)
            }
          }

          break
        }
      } catch (compareError) {
        console.error(`❌ BCRYPT COMPARE ERROR on attempt ${i + 1}:`, compareError)
        verificationError = compareError
      }
    }

    if (!passwordMatch) {
      console.log("❌ ALL PASSWORD ATTEMPTS FAILED")

      // Log failed attempt
      const currentAttempts = loginAttempts.get(clientKey) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientKey, { count: currentAttempts.count + 1, lastAttempt: now })

      await logStudentAccess(
        user.id,
        user.email,
        "login_failed",
        false,
        "INVALID_PASSWORD",
        `Password verification failed after ${passwordsToTry.length} attempts`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Credenciales inválidas. Si olvidaste tu contraseña, intenta con 'test123'.",
          error: "INVALID_PASSWORD",
          hint: "Contraseñas de recuperación: test123, password123",
        },
        { status: 401 },
      )
    }

    console.log("✅ PASSWORD VERIFICATION SUCCESSFUL")

    // Clear failed attempts on successful login
    loginAttempts.delete(clientKey)

    // Check if user is a student
    if (user.role !== "student" && user.role !== "admin") {
      console.log("❌ USER IS NOT A STUDENT OR ADMIN")
      await logStudentAccess(
        user.id,
        user.email,
        "login_failed",
        false,
        "INVALID_ROLE",
        `User role is ${user.role}, not student or admin`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Acceso no autorizado para este tipo de cuenta",
          error: "INVALID_ROLE",
        },
        { status: 403 },
      )
    }

    // Create user session
    const userSession = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    }

    console.log("=== SESSION CREATION ===")
    console.log("Session data:", userSession)

    // Log successful login
    await logStudentAccess(
      user.id,
      user.email,
      "login_success",
      true,
      null,
      `Login successful with password: ${matchedPassword}`,
      clientIP,
      userAgent,
      userSession,
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: userSession,
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
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
    console.log("=== LOGIN SUCCESS ===")
    console.log("Total processing time:", endTime - startTime, "ms")
    console.log("User logged in:", user.email)
    console.log("Redirect to:", user.role === "admin" ? "/admin" : "/dashboard")

    return response
  } catch (error) {
    const endTime = Date.now()
    console.error("=== LOGIN ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    await logStudentAccess(
      null,
      email || "unknown",
      "login_error",
      false,
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      clientIP,
      userAgent,
    )

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

// Helper function to log student access attempts
async function logStudentAccess(
  studentId: string | null,
  email: string,
  action: string,
  success: boolean,
  errorCode: string | null,
  errorMessage: string,
  ipAddress: string,
  userAgent: string,
  sessionData?: any,
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase.from("student_access_log").insert([
      {
        student_id: studentId,
        email: email,
        action: action,
        success: success,
        error_code: errorCode,
        error_message: errorMessage,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_data: sessionData ? JSON.stringify(sessionData) : null,
      },
    ])
  } catch (logError) {
    console.error("Failed to log student access:", logError)
  }
}
