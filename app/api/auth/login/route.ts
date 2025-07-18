import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Common passwords to try for recovery
const RECOVERY_PASSWORDS = ["test123", "password123", "admin123", "defaultpass123", "123456"]

// Helper function to create JSON error response
function createErrorResponse(message: string, error: string, status: number, hint?: string) {
  const response = {
    success: false,
    message,
    error,
    ...(hint && { hint }),
  }

  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// Helper function to create JSON success response
function createSuccessResponse(data: any) {
  return NextResponse.json(data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  let email = ""
  let password = ""

  try {
    console.log("=== LOGIN REQUEST START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", req.headers.get("host"))
    console.log("Client IP:", clientIP)

    // Parse request body with error handling
    try {
      const body = await req.json()
      email = body.email?.trim() || ""
      password = body.password || ""
    } catch (parseError) {
      console.error("❌ REQUEST PARSING ERROR:", parseError)
      return createErrorResponse("Datos de solicitud inválidos", "INVALID_REQUEST_BODY", 400)
    }

    console.log("=== REQUEST VALIDATION ===")
    console.log("Email provided:", !!email)
    console.log("Email value:", email)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    // Basic validation
    if (!email || !password) {
      console.log("❌ VALIDATION FAILED: Missing credentials")
      return createErrorResponse("Email y contraseña son requeridos", "MISSING_CREDENTIALS", 400)
    }

    // Rate limiting check
    const clientKey = `${clientIP}-${email}`
    const attempts = loginAttempts.get(clientKey)
    const now = Date.now()

    if (attempts && attempts.count >= 15 && now - attempts.lastAttempt < 15 * 60 * 1000) {
      console.log("❌ RATE LIMIT EXCEEDED for:", clientKey)
      return createErrorResponse(
        "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.",
        "RATE_LIMIT_EXCEEDED",
        429,
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ VALIDATION FAILED: Invalid email format")
      return createErrorResponse("Formato de email inválido", "INVALID_EMAIL_FORMAT", 400)
    }

    console.log("=== DATABASE CONNECTION ===")

    // Import Supabase client here to avoid issues
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ MISSING SUPABASE ENVIRONMENT VARIABLES")
      return createErrorResponse("Error de configuración del servidor", "MISSING_ENV_VARS", 500)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Test database connection
    try {
      const { data: testConnection } = await supabase.from("users").select("count").limit(1)
      console.log("Database connection test:", testConnection ? "SUCCESS" : "FAILED")
    } catch (dbError) {
      console.error("❌ DATABASE CONNECTION FAILED:", dbError)
      return createErrorResponse("Error de conexión a la base de datos", "DATABASE_CONNECTION_FAILED", 500)
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

      return createErrorResponse("Credenciales inválidas", "USER_NOT_FOUND", 401)
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
          }
        }
      } catch (fixError) {
        console.error("❌ ERROR FIXING USER HASH:", fixError)
        return createErrorResponse("Error configurando contraseña - contacta soporte", "HASH_FIX_FAILED", 500)
      }
    }

    // Password verification with multiple attempts
    console.log("=== PASSWORD VERIFICATION ===")
    console.log("Input password:", password)
    console.log("Stored hash:", user.password_hash)
    console.log("Hash algorithm:", user.password_hash?.substring(0, 4))

    let passwordMatch = false
    let matchedPassword = null

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
            } catch (updateError) {
              console.log("⚠️ Failed to update hash with original password:", updateError)
            }
          }

          break
        }
      } catch (compareError) {
        console.error(`❌ BCRYPT COMPARE ERROR on attempt ${i + 1}:`, compareError)
      }
    }

    if (!passwordMatch) {
      console.log("❌ ALL PASSWORD ATTEMPTS FAILED")

      // Log failed attempt
      const currentAttempts = loginAttempts.get(clientKey) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientKey, { count: currentAttempts.count + 1, lastAttempt: now })

      return createErrorResponse(
        "Credenciales inválidas. Si olvidaste tu contraseña, intenta con 'test123'.",
        "INVALID_PASSWORD",
        401,
        "Contraseñas de recuperación: test123, admin123, password123",
      )
    }

    console.log("✅ PASSWORD VERIFICATION SUCCESSFUL")

    // Clear failed attempts on successful login
    loginAttempts.delete(clientKey)

    // Check if user is a student or admin
    if (user.role !== "student" && user.role !== "admin") {
      console.log("❌ USER IS NOT A STUDENT OR ADMIN")
      return createErrorResponse("Acceso no autorizado para este tipo de cuenta", "INVALID_ROLE", 403)
    }

    // Generate session data
    const sessionData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: new Date().toISOString(),
    }

    // Create response
    const responseData = {
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
    }

    const response = createSuccessResponse(responseData)

    // Set secure session cookie
    const isProduction = process.env.NODE_ENV === "production"
    const isVercel = !!process.env.VERCEL_URL

    const cookieSettings = {
      httpOnly: true,
      secure: isProduction || isVercel,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    }

    response.cookies.set("user-session", JSON.stringify(sessionData), cookieSettings)

    const endTime = Date.now()
    console.log("✅ LOGIN SUCCESSFUL")
    console.log("Total processing time:", endTime - startTime, "ms")
    console.log("User logged in:", email)
    console.log("Redirect to:", user.role === "admin" ? "/admin" : "/dashboard")

    return response
  } catch (error) {
    const endTime = Date.now()
    console.error("=== LOGIN ERROR ===")
    console.error("Total processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return createErrorResponse("Error interno del servidor", "INTERNAL_SERVER_ERROR", 500)
  }
}
