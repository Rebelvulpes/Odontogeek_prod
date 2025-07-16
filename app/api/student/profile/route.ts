import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(req: NextRequest) {
  try {
    console.log("=== UPDATE STUDENT PROFILE ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get user session
    const sessionCookie = req.cookies.get("user-session")
    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE")
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie.value)
      console.log("Session user ID:", userSession.id)
      console.log("Session role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    // Get update data
    const { first_name, last_name, email } = await req.json()

    console.log("=== UPDATE DATA ===")
    console.log("First name:", first_name)
    console.log("Last name:", last_name)
    console.log("Email:", email)

    // Validation
    if (!first_name || !last_name || !email) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if email is already taken by another user
    if (email.toLowerCase().trim() !== userSession.email.toLowerCase().trim()) {
      console.log("=== CHECKING EMAIL AVAILABILITY ===")
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .neq("id", userSession.id)
        .single()

      if (existingUser) {
        console.log("❌ EMAIL ALREADY TAKEN")
        return NextResponse.json(
          {
            success: false,
            message: "Este email ya está en uso",
            error: "EMAIL_ALREADY_TAKEN",
          },
          { status: 409 },
        )
      }
    }

    // Update user
    console.log("=== UPDATING USER ===")
    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      updated_at: new Date().toISOString(),
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userSession.id)
      .select()
      .single()

    console.log("Update result:")
    console.log("- Success:", !updateError)
    console.log("- Error:", updateError)
    console.log("- Updated user:", !!updatedUser)

    if (updateError) {
      console.error("❌ UPDATE ERROR:", updateError)
      return NextResponse.json(
        {
          success: false,
          message: `Error actualizando perfil: ${updateError.message}`,
          error: "UPDATE_FAILED",
        },
        { status: 500 },
      )
    }

    if (!updatedUser) {
      console.log("❌ NO USER RETURNED AFTER UPDATE")
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando perfil",
          error: "NO_USER_RETURNED",
        },
        { status: 500 },
      )
    }

    console.log("✅ PROFILE UPDATED SUCCESSFULLY")
    console.log("Updated user:", updatedUser.email)

    // Update session cookie with new data
    const newUserSession = {
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url,
      created_at: updatedUser.created_at,
    }

    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: newUserSession,
    })

    // Update session cookie
    response.cookies.set("user-session", JSON.stringify(newUserSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("=== UPDATE PROFILE ERROR ===")
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
