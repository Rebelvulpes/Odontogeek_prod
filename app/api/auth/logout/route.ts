import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Crear respuesta de logout exitoso
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    // Eliminar cookie de sesión
    response.cookies.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expira inmediatamente
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in logout API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
