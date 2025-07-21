import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    console.log("=== CHANGE PASSWORD REQUEST ===")
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
      console.log("Session email:", userSession.email)
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

    const { currentPassword, newPassword } = await req.json()

    console.log("=== CHANGE PASSWORD DATA ===")
    console.log("Current password provided:", !!currentPassword)
    console.log("New password provided:", !!newPassword)

    // Validation
    if (!currentPassword || !newPassword) {
      console.log("❌ VALIDATION FAILED: Missing passwords")
      return NextResponse.json(
        {
          success: false,
          message: "Contraseña actual y nueva contraseña son requeridas",
          error: "MISSING_PASSWORDS",
        },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      console.log("❌ VALIDATION FAILED: New password too short")
      return NextResponse.json(
        {
          success: false,
          message: "La nueva contraseña debe tener al menos 6 caracteres",
          error: "PASSWORD_TOO_SHORT",
        },
        { status: 400 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current user data
    console.log("=== VERIFYING CURRENT PASSWORD ===")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND:", userError)
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    console.log("Current password valid:", isCurrentPasswordValid)

    if (!isCurrentPasswordValid) {
      console.log("❌ CURRENT PASSWORD INVALID")
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña actual es incorrecta",
          error: "INVALID_CURRENT_PASSWORD",
        },
        { status: 400 },
      )
    }

    // Generate new password hash
    console.log("=== GENERATING NEW PASSWORD HASH ===")
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    console.log("New hash generated successfully")

    // Verify new hash immediately
    const hashVerification = await bcrypt.compare(newPassword, newPasswordHash)
    console.log("New hash verification:", hashVerification)

    if (!hashVerification) {
      return NextResponse.json(
        {
          success: false,
          message: "Error generando hash de nueva contraseña",
          error: "HASH_GENERATION_FAILED",
        },
        { status: 500 },
      )
    }

    // Update password
    console.log("=== UPDATING PASSWORD ===")
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ UPDATE ERROR:", updateError)
      return NextResponse.json(
        {
          success: false,
          message: `Error actualizando contraseña: ${updateError.message}`,
          error: "UPDATE_FAILED",
        },
        { status: 500 },
      )
    }

    console.log("✅ PASSWORD CHANGED SUCCESSFULLY")

    // Log the password change
    try {
      await supabase.from("auth_debug_log").insert([
        {
          email: user.email,
          action: "password_change",
          success: true,
          error_message: "Password changed successfully",
          hash_preview: newPasswordHash.substring(0, 20),
        },
      ])
    } catch (logError) {
      console.error("Failed to log password change:", logError)
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("=== CHANGE PASSWORD ERROR ===")
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
