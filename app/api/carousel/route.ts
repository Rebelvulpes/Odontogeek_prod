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
      .eq("is_active", true)
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

    // Transformar los datos para que coincidan con la interfaz del carousel
    const transformedSlides =
      slides?.map((slide) => ({
        id: slide.id,
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        backgroundColor: slide.background_color || "from-blue-900 to-indigo-900",
        promoImage: slide.image_url || "",
        badge: slide.badge_text || "Nuevo",
        badgeColor: slide.badge_color || "bg-green-500",
        cta: slide.cta_text || "Ver más",
        ctaLink: slide.cta_link || "/courses",
        type: slide.slide_type || "course",
        stats: [
          { icon: "Users", label: "Estudiantes", value: "1,000+" },
          { icon: "Play", label: "Lecciones", value: "20+" },
          { icon: "Award", label: "Certificado", value: "Incluido" },
        ],
      })) || []

    return NextResponse.json({
      success: true,
      data: transformedSlides,
    })
  } catch (error) {
    console.error("Error en GET carousel:", error)
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
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "El campo 'title' es requerido",
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
          subtitle: "",
          description: description || "",
          image_url: image_url || "",
          cta_text: "Ver más",
          cta_link: link_url || "/courses",
          background_color: "from-blue-900 to-indigo-900",
          badge_text: "Nuevo",
          badge_color: "bg-green-500",
          order_index: order_index ? Number.parseInt(order_index) : 1,
          slide_type: "course",
          is_active: is_active !== undefined ? is_active : true,
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
