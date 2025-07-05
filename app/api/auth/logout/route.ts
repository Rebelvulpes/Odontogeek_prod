import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
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
    console.error("Error cerrando sesión:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error cerrando sesión",
      },
      { status: 500 },
    )
  }
}
