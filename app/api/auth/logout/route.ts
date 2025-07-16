import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("Logout request received")

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

    console.log("Logout successful")
    return response
  } catch (error) {
    console.error("Error in logout:", error)
    return NextResponse.json({
      success: false,
      message: "Error cerrando sesión",
    })
  }
}
