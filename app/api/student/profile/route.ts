import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT PROFILE ===")

    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    const sessionData = JSON.parse(sessionCookie.value)

    if (!sessionData.id) {
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, avatar_url, created_at")
      .eq("id", sessionData.id)
      .single()

    if (userError || !user) {
      console.error("❌ Error fetching user:", userError)
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    console.log("✅ Profile retrieved for:", user.email)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("❌ Error getting profile:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log("=== UPDATE STUDENT PROFILE ===")

    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    const sessionData = JSON.parse(sessionCookie.value)

    if (!sessionData.id) {
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    const { first_name, last_name, email } = await req.json()

    console.log("Updating profile for user:", sessionData.id)
    console.log("New data:", { first_name, last_name, email })

    if (!first_name || !last_name || !email) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Formato de email inválido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe (excepto el usuario actual)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .neq("id", sessionData.id)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Este email ya está en uso",
      })
    }

    // Actualizar usuario
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionData.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating user:", updateError)
      return NextResponse.json({
        success: false,
        message: "Error actualizando perfil",
      })
    }

    console.log("✅ Profile updated successfully")

    // Actualizar cookie de sesión si cambió el email
    const newSessionData = {
      ...sessionData,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
    }

    const response = NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    })

    response.cookies.set("user-session", JSON.stringify(newSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Error updating profile:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
