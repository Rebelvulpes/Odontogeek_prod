import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: tags, error } = await supabase.from("course_tags").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error obteniendo tags:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo tags",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: tags || [],
    })
  } catch (error) {
    console.error("Error en GET tags:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { name, color } = body

    // Validar campos requeridos
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "El campo nombre es requerido",
        },
        { status: 400 },
      )
    }

    // Crear el tag
    const { data: tag, error: tagError } = await supabase
      .from("course_tags")
      .insert([
        {
          name,
          color: color || "#3B82F6",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (tagError) {
      console.error("Error creando tag:", tagError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando tag",
          error: tagError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tag creado exitosamente",
      data: tag,
    })
  } catch (error) {
    console.error("Error en POST tag:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
