import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: slides, error } = await supabase
      .from("carousel_slides")
      .select(`
        *,
        carousel_slide_stats (
          icon_name,
          label,
          value,
          order_index
        )
      `)
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error obteniendo slides del carrusel:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo slides del carrusel",
          error: error,
        },
        { status: 500 },
      )
    }

    // Procesar los slides para el formato esperado por el frontend
    const processedSlides =
      slides?.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        backgroundColor: slide.background_color,
        promoImage: slide.image_url,
        badge: slide.badge_text,
        badgeColor: slide.badge_color,
        cta: slide.cta_text,
        ctaLink: slide.cta_link,
        type: slide.slide_type,
        stats:
          slide.carousel_slide_stats
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((stat) => ({
              icon: stat.icon_name,
              label: stat.label,
              value: stat.value,
            })) || [],
      })) || []

    return NextResponse.json({
      success: true,
      data: processedSlides,
    })
  } catch (error) {
    console.error("Error en la API del carrusel:", error)
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

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { data: slide, error } = await supabase
      .from("carousel_slides")
      .insert({
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        image_url: body.image_url,
        cta_text: body.cta_text,
        cta_link: body.cta_link,
        background_color: body.background_color,
        badge_text: body.badge_text,
        badge_color: body.badge_color,
        order_index: body.order_index,
        slide_type: body.slide_type,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: "Error creando slide", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Slide creado exitosamente",
      data: slide,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
