import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("=== LOGOUT REQUEST ===")

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

    console.log("✅ Session cookie cleared")
    return response
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({
      success: false,
      message: "Error cerrando sesión",
    })
  }
}
