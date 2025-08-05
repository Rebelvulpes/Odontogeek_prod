import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  try {
    console.log("=== CHANGE PASSWORD REQUEST ===")

    // Get user session
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json(
        {
          success: false,
          message: "Sesión no válida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    const { current_password, new_password } = await req.json()

    if (!current_password || !new_password) {
      return NextResponse.json(
        {
          success: false,
          message: "Contraseña actual y nueva contraseña son requeridas",
          error: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "La nueva contraseña debe tener al menos 6 caracteres",
          error: "WEAK_PASSWORD",
        },
        { status: 400 },
      )
    }

    const supabase = getServerSupabaseClient()

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .eq("id", userSession.id)
      .single()

    if (userError || !userData) {
      console.error("❌ Error fetching user:", userError)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "CHANGE_PASSWORD",
        false,
        "USER_NOT_FOUND",
        "User not found in database",
      )
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
    const isCurrentPasswordValid = await bcrypt.compare(current_password, userData.password_hash)

    if (!isCurrentPasswordValid) {
      console.log("❌ Current password is invalid")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "CHANGE_PASSWORD",
        false,
        "INVALID_CURRENT_PASSWORD",
        "Current password verification failed",
      )
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña actual es incorrecta",
          error: "INVALID_CURRENT_PASSWORD",
        },
        { status: 400 },
      )
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds)

    // Update password in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userSession.id)

    if (updateError) {
      console.error("❌ Error updating password:", updateError)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "CHANGE_PASSWORD",
        false,
        "UPDATE_FAILED",
        updateError.message,
      )
      return NextResponse.json(
        {
          success: false,
          message: "Error al actualizar la contraseña",
          error: "UPDATE_FAILED",
        },
        { status: 500 },
      )
    }

    console.log("✅ Password changed successfully for user:", userData.email)
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "CHANGE_PASSWORD",
      true,
      null,
      "Password changed successfully",
    )

    return NextResponse.json({
      success: true,
      message: "Contraseña cambiada correctamente",
    })
  } catch (error) {
    console.error("❌ Change password error:", error)
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
