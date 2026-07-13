import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Protección: Solo admins pueden subir imágenes
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary no está configurado" }, { status: 500 });
    }

    // Preparar firma para subida segura (Signed Upload)
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    // Convertir File a base64 para enviarlo mediante JSON o mantenerlo como FormData
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", base64Data);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp);
    cloudinaryFormData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Error:", data);
      return NextResponse.json({ error: data.error?.message || "Error al subir a Cloudinary" }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: data.secure_url });
  } catch (error) {
    console.error("[UPLOAD_API_ERROR]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
