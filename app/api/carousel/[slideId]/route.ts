import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PUT(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const { slideId } = params
    const body = await request.json()

    console.log("🔄 Updating carousel slide:", slideId, body)

    // Get current slide data first to preserve existing values
    const { data: currentSlide, error: fetchError } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("id", slideId)
      .single()

    if (fetchError) {
      console.error("❌ Error fetching current slide:", fetchError)
      return NextResponse.json({ error: "Slide not found", details: fetchError.message }, { status: 404 })
    }

    console.log("📄 Current slide data:", currentSlide)

    // Prepare update data, preserving existing values when new ones aren't provided
    const updateData = {
      title: body.title !== undefined ? body.title : currentSlide.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : currentSlide.subtitle,
      image_url: body.image_url !== undefined ? body.image_url : currentSlide.image_url,
      button_text: body.button_text !== undefined ? body.button_text : currentSlide.button_text,
      button_link: body.button_link !== undefined ? body.button_link : currentSlide.button_link,
      is_active: body.is_active !== undefined ? body.is_active : currentSlide.is_active,
      order_index: body.order_index !== undefined ? body.order_index : currentSlide.order_index,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Update data:", updateData)

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .update(updateData)
      .eq("id", slideId)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating slide:", error)
      return NextResponse.json({ error: "Failed to update slide", details: error.message }, { status: 500 })
    }

    console.log("✅ Slide updated successfully:", slide)
    return NextResponse.json({ slide })
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const { slideId } = params

    console.log("🗑️ Deleting carousel slide:", slideId)

    const { error } = await supabase.from("carousel_slides").delete().eq("id", slideId)

    if (error) {
      console.error("❌ Error deleting slide:", error)
      return NextResponse.json({ error: "Failed to delete slide", details: error.message }, { status: 500 })
    }

    console.log("✅ Slide deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
