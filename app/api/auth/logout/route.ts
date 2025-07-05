import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })

    // Eliminar la cookie de sesión
    response.cookies.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expira inmediatamente
    })

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
