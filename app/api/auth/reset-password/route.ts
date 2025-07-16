import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    console.log("=== PASSWORD RESET REQUEST ===")

    const { token, newPassword, email } = await req.json()

    console.log("Token provided:", !!token)
    console.log("New password provided:", !!newPassword)
    console.log("Email provided:", email)

    if (!token && !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Token o email requerido",
          error: "MISSING_TOKEN_OR_EMAIL",
        },
        { status: 400 },
      )
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Nueva contraseña debe tener al menos 6 caracteres",
          error: "INVALID_PASSWORD",
        },
        { status: 400 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate new password hash
    console.log("=== GENERATING NEW PASSWORD HASH ===")
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    console.log("New hash generated successfully")

    // Verify hash immediately
    const hashVerification = await bcrypt.compare(newPassword, newPasswordHash)
    console.log("Hash verification:", hashVerification)

    if (!hashVerification) {
      return NextResponse.json(
        {
          success: false,
          message: "Error generando hash de contraseña",
          error: "HASH_GENERATION_FAILED",
        },
        { status: 500 },
      )
    }

    if (token) {
      // Reset with token
      console.log("=== RESETTING WITH TOKEN ===")

      const { data: resetResult, error: resetError } = await supabase.rpc("reset_password_with_token", {
        recovery_token: token,
        new_password_hash: newPasswordHash,
      })

      if (resetError) {
        console.error("Reset error:", resetError)
        return NextResponse.json(
          {
            success: false,
            message: "Error ejecutando reset de contraseña",
            error: "RESET_FUNCTION_ERROR",
          },
          { status: 500 },
        )
      }

      const result = resetResult[0]
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: "RESET_FAILED",
          },
          { status: 400 },
        )
      }

      console.log("✅ Password reset successful with token")
    } else if (email) {
      // Direct reset by email (for debugging/admin purposes)
      console.log("=== DIRECT RESET BY EMAIL ===")

      const { error: updateError } = await supabase
        .from("users")
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase().trim())

      if (updateError) {
        console.error("Direct update error:", updateError)
        return NextResponse.json(
          {
            success: false,
            message: "Error actualizando contraseña directamente",
            error: "DIRECT_UPDATE_FAILED",
          },
          { status: 500 },
        )
      }

      console.log("✅ Password reset successful by email")
    }

    // Log the password reset
    try {
      await supabase.from("auth_debug_log").insert([
        {
          email: email || "token-based",
          action: "password_reset",
          success: true,
          error_message: token ? "Password reset with token" : "Direct password reset",
          hash_preview: newPasswordHash.substring(0, 20),
        },
      ])
    } catch (logError) {
      console.error("Failed to log password reset:", logError)
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("=== PASSWORD RESET ERROR ===")
    console.error("Error details:", error)

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
