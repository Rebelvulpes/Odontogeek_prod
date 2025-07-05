import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

interface Params {
  params: {
    tagId: string
  }
}

export async function DELETE(request: Request, { params: { tagId } }: Params) {
  const supabase = createRouteHandlerClient({ cookies })

  // Skip deleting relations since the table structure is different
  // Just delete the tag directly
  const { error } = await supabase.from("course_tags").delete().eq("id", tagId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Tag deleted successfully" })
}
