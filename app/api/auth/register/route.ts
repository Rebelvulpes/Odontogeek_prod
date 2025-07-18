import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { logStudentAccess } from "@/lib/utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  let email: string | undefined // Declare email variable

  try {
    console.log("=== STUDENT REGISTRATION ATTEMPT START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Client IP:", clientIP)
    console.log("User Agent:", userAgent)

    const { email: reqEmail, password, firstName, lastName } = await req.json()
    email = reqEmail // Assign email from request

    console.log("=== REQUEST DATA ===")
    console.log("Email:", email)
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    // Comprehensive validation
    const validationErrors = []

    if (!email) validationErrors.push("Email es requerido")
    if (!password) validationErrors.push("Contraseña es requerida")
    if (!firstName) validationErrors.push("Nombre es requerido")
    if (!lastName) validationErrors.push("Apellido es requerido")

    if (validationErrors.length > 0) {
      console.log("❌ VALIDATION FAILED:", validationErrors)
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "MISSING_REQUIRED_FIELDS",
        validationErrors.join(", "),
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: validationErrors.join(", "),
          error: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      console.log("❌ VALIDATION FAILED: Password too short")
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "PASSWORD_TOO_SHORT",
        "La contraseña debe tener al menos 6 caracteres",
        clientIP,
        userAgent,
      )

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
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
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
        "registration_attempt",
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

    // Check if user already exists
    console.log("=== CHECKING EXISTING USER ===")
    const normalizedEmail = email.toLowerCase().trim()
    console.log("Checking for email:", normalizedEmail)

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", normalizedEmail)
      .single()

    console.log("Existing user check result:")
    console.log("- User found:", !!existingUser)
    console.log("- Check error:", checkError)

    if (existingUser) {
      console.log("❌ USER ALREADY EXISTS")
      await logStudentAccess(
        existingUser.id,
        email,
        "registration_attempt",
        false,
        "USER_ALREADY_EXISTS",
        "Ya existe un usuario con este email",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un usuario con este email",
          error: "USER_ALREADY_EXISTS",
        },
        { status: 409 },
      )
    }

    // Generate password hash with comprehensive verification
    console.log("=== GENERATING PASSWORD HASH ===")
    const saltRounds = 10
    console.log("Salt rounds:", saltRounds)
    console.log("Password to hash length:", password.length)

    let passwordHash: string
    let hashVerified = false
    let attempts = 0
    const maxAttempts = 5

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

        // Comprehensive hash verification
        let verifyAttempts = 0
        let verifySuccess = false
        const maxVerifyAttempts = 5

        while (!verifySuccess && verifyAttempts < maxVerifyAttempts) {
          verifyAttempts++
          console.log(`Hash verification attempt ${verifyAttempts}/${maxVerifyAttempts}`)

          try {
            const verifyStart = Date.now()
            const verifyResult = await bcrypt.compare(password, passwordHash)
            const verifyEnd = Date.now()

            console.log(`Hash verification attempt ${verifyAttempts} completed in:`, verifyEnd - verifyStart, "ms")
            console.log(`Hash verification attempt ${verifyAttempts} result:`, verifyResult)

            if (verifyResult) {
              hashVerified = true
              verifySuccess = true
              console.log("✅ HASH VERIFICATION SUCCESSFUL")
              break
            } else {
              console.log(`❌ Hash verification failed on attempt ${verifyAttempts}`)
              // Wait a bit before retrying
              await new Promise((resolve) => setTimeout(resolve, 100))
            }
          } catch (verifyError) {
            console.error(`❌ Hash verification error on attempt ${verifyAttempts}:`, verifyError)
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        if (!hashVerified) {
          console.log(`❌ Hash verification failed after ${verifyAttempts} attempts, retrying hash generation`)
          // Wait before retrying hash generation
          await new Promise((resolve) => setTimeout(resolve, 200))
          continue
        }
      } catch (hashError) {
        console.error(`❌ HASH GENERATION ERROR on attempt ${attempts}:`, hashError)
        if (attempts === maxAttempts) {
          await logStudentAccess(
            null,
            email,
            "registration_attempt",
            false,
            "HASH_GENERATION_ERROR",
            "Error procesando contraseña",
            clientIP,
            userAgent,
          )

          return NextResponse.json(
            {
              success: false,
              message: "Error procesando contraseña",
              error: "HASH_GENERATION_ERROR",
            },
            { status: 500 },
          )
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    if (!hashVerified) {
      console.error("❌ FAILED TO GENERATE VERIFIED HASH AFTER ALL ATTEMPTS")
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "HASH_VERIFICATION_FAILED",
        "Error generando hash de contraseña seguro",
        clientIP,
        userAgent,
      )

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
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "USER_CREATION_FAILED",
        `Error creando usuario: ${createError.message}`,
        clientIP,
        userAgent,
      )

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
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "NO_USER_RETURNED",
        "Error: No se pudo crear el usuario",
        clientIP,
        userAgent,
      )

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

    // Comprehensive post-creation verification
    console.log("=== POST-CREATION VERIFICATION ===")
    let verificationPassed = false
    let verificationAttempts = 0
    const maxVerificationAttempts = 3

    while (!verificationPassed && verificationAttempts < maxVerificationAttempts) {
      verificationAttempts++
      console.log(`Post-creation verification attempt ${verificationAttempts}/${maxVerificationAttempts}`)

      try {
        const loginVerification = await bcrypt.compare(password, newUser.password_hash)
        console.log(`Post-creation login verification attempt ${verificationAttempts}:`, loginVerification)

        if (loginVerification) {
          verificationPassed = true
          console.log("✅ POST-CREATION VERIFICATION SUCCESSFUL")
        } else {
          console.log(`❌ Post-creation verification failed on attempt ${verificationAttempts}`)

          if (verificationAttempts === maxVerificationAttempts) {
            // Last attempt - try to fix the user
            console.log("🔄 ATTEMPTING TO FIX USER HASH")
            const fixHash = await bcrypt.hash(password, 10)
            const { error: fixError } = await supabase
              .from("users")
              .update({
                password_hash: fixHash,
                updated_at: new Date().toISOString(),
              })
              .eq("id", newUser.id)

            if (!fixError) {
              console.log("✅ User hash fixed after creation")
              newUser.password_hash = fixHash
              verificationPassed = true
            } else {
              console.log("❌ Failed to fix user hash:", fixError)
            }
          }
        }
      } catch (verifyError) {
        console.error(`❌ POST-CREATION VERIFICATION ERROR on attempt ${verificationAttempts}:`, verifyError)
      }

      if (!verificationPassed && verificationAttempts < maxVerificationAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // Create default enrollment for new student
    console.log("=== CREATING DEFAULT ENROLLMENT ===")
    try {
      const { data: availableCourse } = await supabase
        .from("courses")
        .select("id, title")
        .where("title", "ilike", "%Bienvenida%")
        .limit(1)
        .single()

      if (availableCourse) {
        const { error: enrollmentError } = await supabase.from("enrollments").insert([
          {
            user_id: newUser.id,
            course_id: availableCourse.id,
            enrolled_at: new Date().toISOString(),
            progress: 0,
            status: "active",
          },
        ])

        if (!enrollmentError) {
          console.log("✅ Default enrollment created for course:", availableCourse.title)
        } else {
          console.log("⚠️ Failed to create default enrollment:", enrollmentError)
        }
      } else {
        console.log("⚠️ No welcome course found to enroll new user.")
      }
    } catch (enrollmentError) {
      console.log("⚠️ Error creating default enrollment:", enrollmentError)
    }

    // Create user session
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

    // Log successful registration
    await logStudentAccess(
      newUser.id,
      newUser.email,
      "registration_success",
      true,
      null,
      "Usuario registrado exitosamente",
      clientIP,
      userAgent,
      userSession,
    )

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

    await logStudentAccess(
      null,
      email || "unknown",
      "registration_error",
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
