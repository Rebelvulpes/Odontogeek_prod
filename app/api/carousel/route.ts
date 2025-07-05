import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: slides, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error obteniendo slides:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo slides",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: slides || [],
    })
  } catch (error) {
    console.error("Error en GET slides:", error)
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

    const { title, description, image_url, link_url, is_active, order_index } = body

    // Validar campos requeridos
    if (!title || !description || !image_url) {
      return NextResponse.json(
        {
          success: false,
          message: "Los campos título, descripción e imagen son requeridos",
        },
        { status: 400 },
      )
    }

    // Crear el slide
    const { data: slide, error: slideError } = await supabase
      .from("carousel_slides")
      .insert([
        {
          title,
          description,
          image_url,
          link_url: link_url || null,
          is_active: is_active !== undefined ? is_active : true,
          order_index: Number.parseInt(order_index) || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (slideError) {
      console.error("Error creando slide:", slideError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando slide",
          error: slideError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Slide creado exitosamente",
      data: slide,
    })
  } catch (error) {
    console.error("Error en POST slide:", error)
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
