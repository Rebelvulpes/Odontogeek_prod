import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Obtener la cookie de sesión
    const userSession = req.cookies.get("user-session")?.value

    if (!userSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Parsear los datos del usuario desde la cookie
    const userData = JSON.parse(userSession)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        avatar_url: userData.avatar_url || null,
        created_at: userData.created_at,
      },
    })
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
