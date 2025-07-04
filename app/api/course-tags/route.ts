import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: tags, error } = await supabase.from("course_tags").select("*").order("name", { ascending: true })

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error obteniendo etiquetas: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color, description } = await req.json()

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "El nombre de la etiqueta es requerido",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear slug a partir del nombre
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .trim()

    const { data: newTag, error } = await supabase
      .from("course_tags")
      .insert([
        {
          name,
          slug,
          color: color || "#3B82F6",
          description,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error creando etiqueta: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Etiqueta creada exitosamente",
      data: newTag[0],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
