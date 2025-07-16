import { NextResponse } from "next/server"

export async function POST() {
  try {
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
    })

    return response
  } catch (error) {
    console.error("Error in logout API:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
