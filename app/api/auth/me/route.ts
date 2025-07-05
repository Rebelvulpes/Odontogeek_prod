import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userSession = req.cookies.get("user-session")

    if (!userSession) {
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    let sessionData
    try {
      sessionData = JSON.parse(userSession.value)
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    // Verificar que la sesión tenga los datos necesarios
    if (!sessionData.id || !sessionData.email || !sessionData.role) {
      return NextResponse.json({
        success: false,
        message: "Datos de sesión incompletos",
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name || sessionData.email,
        role: sessionData.role,
      },
    })
  } catch (error) {
    console.error("Error verificando autenticación:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
