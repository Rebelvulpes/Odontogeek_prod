import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // Eliminar la cookie de autenticación
    cookieStore.delete("auth-token")

    return NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
