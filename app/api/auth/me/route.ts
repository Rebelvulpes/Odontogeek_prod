import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Obtener usuario de la cookie de sesión
    const userSession = req.cookies.get("user-session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Parsear datos del usuario
    const userData = JSON.parse(userSession)

    // Retornar información del usuario
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name || userData.name?.split(" ")[0] || "",
        last_name: userData.last_name || userData.name?.split(" ").slice(1).join(" ") || "",
        avatar_url: userData.avatar_url || null,
        role: userData.role || "student",
        created_at: userData.created_at,
      },
    })
  } catch (error) {
    console.error("Error in auth/me API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
