import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: tags, error } = await supabase.from("course_tags").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error obteniendo etiquetas:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo etiquetas: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: tags || [],
    })
  } catch (error) {
    console.error("Error interno en GET /api/course-tags:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, color, description } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generar slug único
    const slug = generateSlug(name)

    // Verificar si el slug ya existe
    const { data: existingTag } = await supabase.from("course_tags").select("id").eq("slug", slug).single()

    if (existingTag) {
      return NextResponse.json({
        success: false,
        message: "Ya existe una etiqueta con ese nombre",
      })
    }

    // Crear la etiqueta
    const { data: tag, error: tagError } = await supabase
      .from("course_tags")
      .insert({
        name,
        slug,
        color: color || "#3B82F6",
        description: description || null,
      })
      .select()
      .single()

    if (tagError) {
      console.error("Error creando etiqueta:", tagError)
      return NextResponse.json({
        success: false,
        message: `Error creando etiqueta: ${tagError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: tag,
      message: "Etiqueta creada exitosamente",
    })
  } catch (error) {
    console.error("Error interno en POST /api/course-tags:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
