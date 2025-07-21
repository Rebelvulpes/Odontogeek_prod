import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const { slideId } = params

    const { data: slide, error } = await supabase.from("carousel_slides").select("*").eq("id", slideId).single()

    if (error || !slide) {
      return NextResponse.json(
        { error: "Slide not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return NextResponse.json(
      { slide },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error fetching slide:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const { slideId } = params
    const body = await request.json()

    console.log("🔄 Updating slide:", slideId, "with data:", body)

    // First, get the current slide data
    const { data: currentSlide, error: fetchError } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("id", slideId)
      .single()

    if (fetchError || !currentSlide) {
      console.log("❌ Slide not found:", fetchError)
      return NextResponse.json(
        { error: "Slide not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("📄 Current slide data:", currentSlide)

    // Prepare update data, preserving existing values if new ones aren't provided
    const updateData = {
      title: body.title !== undefined ? body.title : currentSlide.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : currentSlide.subtitle,
      description: body.description !== undefined ? body.description : currentSlide.description,
      button_text: body.button_text !== undefined ? body.button_text : currentSlide.button_text,
      button_link: body.button_link !== undefined ? body.button_link : currentSlide.button_link,
      image_url: body.image_url !== undefined ? body.image_url : currentSlide.image_url,
      order_index: body.order_index !== undefined ? body.order_index : currentSlide.order_index,
      is_active: body.is_active !== undefined ? body.is_active : currentSlide.is_active,
      archived: body.archived !== undefined ? body.archived : currentSlide.archived || false,
    }

    console.log("📝 Update data prepared:", updateData)

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .update(updateData)
      .eq("id", slideId)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating slide:", error)
      return NextResponse.json(
        { error: "Failed to update slide", details: error.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ Slide updated successfully:", slide)

    return NextResponse.json(
      { slide },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("❌ Unexpected error updating slide:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slideId: string } }) {
  try {
    const { slideId } = params

    const { error } = await supabase.from("carousel_slides").delete().eq("id", slideId)

    if (error) {
      console.error("Error deleting slide:", error)
      return NextResponse.json(
        { error: "Failed to delete slide", details: error.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return NextResponse.json(
      { message: "Slide deleted successfully" },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Unexpected error deleting slide:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
