import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT PROFILE REQUEST ===")

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

    const supabase = getServerSupabaseClient()

    const { data: profile, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, avatar_url, bio, role, created_at")
      .eq("id", userSession.id)
      .single()

    if (error || !profile) {
      console.error("❌ Error fetching profile:", error)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "GET_PROFILE",
        false,
        "PROFILE_NOT_FOUND",
        error?.message || "Profile not found",
      )
      return NextResponse.json(
        {
          success: false,
          message: "Perfil no encontrado",
          error: "PROFILE_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    console.log("✅ Profile fetched successfully for user:", profile.email)
    await logStudentAccess(userSession.id, userSession.email, "GET_PROFILE", true, null, "Profile fetched successfully")

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("❌ Get profile error:", error)
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

export async function PUT(req: NextRequest) {
  try {
    console.log("=== UPDATE STUDENT PROFILE REQUEST ===")

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

    const { first_name, last_name, email, bio } = await req.json()

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Nombre, apellido y email son requeridos",
          error: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    const supabase = getServerSupabaseClient()

    // Check if email is already taken by another user
    if (email !== userSession.email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", userSession.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Este email ya está en uso",
            error: "EMAIL_TAKEN",
          },
          { status: 400 },
        )
      }
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        bio: bio?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userSession.id)
      .select("id, email, first_name, last_name, avatar_url, bio, role")
      .single()

    if (updateError) {
      console.error("❌ Error updating profile:", updateError)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "UPDATE_PROFILE",
        false,
        "UPDATE_FAILED",
        updateError.message,
      )
      return NextResponse.json(
        {
          success: false,
          message: "Error al actualizar el perfil",
          error: "UPDATE_FAILED",
        },
        { status: 500 },
      )
    }

    console.log("✅ Profile updated successfully for user:", updatedProfile.email)
    await logStudentAccess(
      userSession.id,
      updatedProfile.email,
      "UPDATE_PROFILE",
      true,
      null,
      "Profile updated successfully",
    )

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("❌ Update profile error:", error)
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
