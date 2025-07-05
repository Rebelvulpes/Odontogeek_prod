import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
        },
        { status: 401 },
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Aquí podrías validar la sesión con la base de datos si es necesario
    // Por ahora, confiamos en la cookie

    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        role: sessionData.role,
        name: sessionData.name || sessionData.email,
      },
    })
  } catch (error) {
    console.error("Error verificando sesión:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error verificando sesión",
      },
      { status: 401 },
    )
  }
}
