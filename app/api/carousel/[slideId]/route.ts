import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { slideId } = params

    const {
      title,
      subtitle,
      description,
      image_url,
      cta_text,
      cta_link,
      background_color,
      badge_text,
      badge_color,
      order_index,
      slide_type,
      is_active,
    } = body

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .update({
        title: title,
        subtitle: subtitle,
        description: description,
        image_url: image_url,
        cta_text: cta_text,
        cta_link: cta_link,
        background_color: background_color,
        badge_text: badge_text,
        badge_color: badge_color,
        order_index: order_index,
        slide_type: slide_type,
        is_active: is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slideId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: "Error actualizando slide", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Slide actualizado exitosamente",
      data: slide,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slideId } = params

    const { error } = await supabase.from("carousel_slides").delete().eq("id", slideId)

    if (error) {
      return NextResponse.json({ success: false, message: "Error eliminando slide", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Slide eliminado exitosamente",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { slideId } = params

    const { is_active } = body

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slideId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: "Error actualizando slide", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Slide ${is_active ? "activado" : "desactivado"} exitosamente`,
      data: slide,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
