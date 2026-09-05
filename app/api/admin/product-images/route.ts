import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const productId = formData.get("productId")

    if (!(file instanceof File) || typeof productId !== "string" || !/^[a-z0-9-]+$/.test(productId)) {
      return NextResponse.json({ error: "Archivo o producto inválido" }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "La imagen debe ser JPG, PNG o WEBP" }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "La imagen no puede superar los 5 MB" }, { status: 400 })
    }

    const extension = EXTENSIONS[file.type]
    const path = `${productId}/${Date.now()}.${extension}`
    const supabase = getSupabaseAdminClient()
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      throw new Error(`No se pudo subir la imagen: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    return NextResponse.json({ data: { url: data.publicUrl } }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
