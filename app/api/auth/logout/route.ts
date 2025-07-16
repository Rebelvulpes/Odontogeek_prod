import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    // Eliminar cookie de sesión
    response.cookies.delete("user-session")

    return response
  } catch (error) {
    console.error("Error in logout:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
