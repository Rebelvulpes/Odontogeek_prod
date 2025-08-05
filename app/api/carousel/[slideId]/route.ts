import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { slideId } = params

    console.log("🔄 Updating slide:", slideId)
    console.log("📝 Update data:", body)

    // Get current slide data first to preserve existing values
    const { data: currentSlide, error: fetchError } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("id", slideId)
      .single()

    if (fetchError || !currentSlide) {
      console.error("❌ Error fetching current slide:", fetchError)
      return NextResponse.json({ success: false, message: "Slide not found", error: fetchError }, { status: 404 })
    }

    console.log("✅ Current slide data:", currentSlide)

    // Prepare update data, preserving existing values if new ones are not provided
    const updateData = {
      title: body.title !== undefined ? body.title : currentSlide.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : currentSlide.subtitle,
      description: body.description !== undefined ? body.description : currentSlide.description,
      image_url: body.image_url !== undefined ? body.image_url : currentSlide.image_url,
      cta_text: body.cta_text !== undefined ? body.cta_text : currentSlide.cta_text,
      cta_link: body.cta_link !== undefined ? body.cta_link : currentSlide.cta_link,
      background_color: body.background_color !== undefined ? body.background_color : currentSlide.background_color,
      badge_text: body.badge_text !== undefined ? body.badge_text : currentSlide.badge_text,
      badge_color: body.badge_color !== undefined ? body.badge_color : currentSlide.badge_color,
      order_index: body.order_index !== undefined ? body.order_index : currentSlide.order_index,
      slide_type: body.slide_type !== undefined ? body.slide_type : currentSlide.slide_type,
      is_active: body.is_active !== undefined ? body.is_active : currentSlide.is_active,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Final update data:", updateData)

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .update(updateData)
      .eq("id", slideId)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating slide:", error)
      return NextResponse.json({ success: false, message: "Error actualizando slide", error }, { status: 500 })
    }

    console.log("✅ Slide updated successfully:", slide)

    return NextResponse.json({
      success: true,
      message: "Slide actualizado exitosamente",
      data: slide,
    })
  } catch (error) {
    console.error("💥 Unexpected error updating slide:", error)
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
