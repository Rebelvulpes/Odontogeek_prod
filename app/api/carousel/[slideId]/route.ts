import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slideId } = params

    const { data: slide, error } = await supabase.from("carousel_slides").select("*").eq("id", slideId).single()

    if (error) {
      console.error("Error obteniendo slide:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo slide",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: slide,
    })
  } catch (error) {
    console.error("Error en GET slide:", error)
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

export async function PUT(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slideId } = params
    const body = await request.json()

    const { title, description, image_url, link_url, is_active, order_index } = body

    // Actualizar el slide
    const { data: slide, error: slideError } = await supabase
      .from("carousel_slides")
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image_url && { image_url }),
        ...(link_url !== undefined && { link_url }),
        ...(is_active !== undefined && { is_active }),
        ...(order_index !== undefined && { order_index: Number.parseInt(order_index) }),
      })
      .eq("id", slideId)
      .select()
      .single()

    if (slideError) {
      console.error("Error actualizando slide:", slideError)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando slide",
          error: slideError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Slide actualizado exitosamente",
      data: slide,
    })
  } catch (error) {
    console.error("Error en PUT slide:", error)
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

export async function PATCH(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slideId } = params
    const body = await request.json()

    const { is_active } = body

    // Actualizar solo el estado activo
    const { data: slide, error: slideError } = await supabase
      .from("carousel_slides")
      .update({
        is_active: is_active,
      })
      .eq("id", slideId)
      .select()
      .single()

    if (slideError) {
      console.error("Error actualizando estado del slide:", slideError)
      return NextResponse.json(
        {
          success: false,
          message: "Error actualizando estado del slide",
          error: slideError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Slide ${is_active ? "activado" : "desactivado"} exitosamente`,
      data: slide,
    })
  } catch (error) {
    console.error("Error en PATCH slide:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slideId } = params

    // Eliminar el slide
    const { error: slideError } = await supabase.from("carousel_slides").delete().eq("id", slideId)

    if (slideError) {
      console.error("Error eliminando slide:", slideError)
      return NextResponse.json(
        {
          success: false,
          message: "Error eliminando slide",
          error: slideError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Slide eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error en DELETE slide:", error)
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
