import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { logStudentAccess, getServerSupabaseClient } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  let email = ""
  let password = ""
  let firstName = ""
  let lastName = ""

  try {
    const body = await req.json()
    email = body.email
    password = body.password
    firstName = body.firstName
    lastName = body.lastName
  } catch (parseError) {
    console.error("❌ REQUEST PARSING ERROR:", parseError)
    return NextResponse.json(
      {
        success: false,
        message: "Datos de solicitud inválidos",
        error: "INVALID_REQUEST_BODY",
      },
      { status: 400 },
    )
  }

  try {
    console.log("=== STUDENT REGISTRATION ATTEMPT START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Email:", email)
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "MISSING_FIELDS",
        "Todos los campos son requeridos",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son requeridos",
          error: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
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

    // Password strength validation
    if (password.length < 6) {
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "WEAK_PASSWORD",
        "La contraseña debe tener al menos 6 caracteres",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
          error: "WEAK_PASSWORD",
        },
        { status: 400 },
      )
    }

    const supabase = getServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingUser) {
      await logStudentAccess(
        null,
        email,
        "registration_attempt",
        false,
        "USER_ALREADY_EXISTS",
        "El usuario ya existe",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Ya existe una cuenta con este email",
          error: "USER_ALREADY_EXISTS",
        },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: "student",
          is_test_user: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (createError || !newUser) {
      console.error("❌ USER CREATION FAILED:", createError)
      await logStudentAccess(
        null,
        email,
        "registration_failed",
        false,
        "USER_CREATION_FAILED",
        createError?.message || "Error creating user",
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Error al crear la cuenta",
          error: "USER_CREATION_FAILED",
        },
        { status: 500 },
      )
    }

    console.log("✅ USER CREATED SUCCESSFULLY:", newUser.id)

    // Auto-enroll in welcome course
    const { data: welcomeCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("title", "Curso de Bienvenida")
      .single()

    if (welcomeCourse) {
      const { error: enrollError } = await supabase.from("enrollments").insert([
        {
          user_id: newUser.id,
          course_id: welcomeCourse.id,
          enrolled_at: new Date().toISOString(),
          progress: 0,
        },
      ])

      if (!enrollError) {
        console.log("✅ USER AUTO-ENROLLED IN WELCOME COURSE")
      }
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

    // Log successful registration
    await logStudentAccess(
      newUser.id,
      newUser.email,
      "registration_success",
      true,
      null,
      "User registered successfully",
      clientIP,
      userAgent,
      userSession,
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: userSession,
      redirectTo: "/dashboard",
    })

    // Set session cookie
    const cookieValue = JSON.stringify(userSession)
    response.cookies.set("user-session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("=== REGISTRATION SUCCESS ===")
    console.log("User registered:", newUser.email)

    return response
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===")
    console.error("Error details:", error)

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
