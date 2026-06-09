import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const productsDir = path.join(process.cwd(), "public", "products");
    
    // Check if directory exists
    if (!fs.existsSync(productsDir)) {
      return NextResponse.json({ success: true, images: [] });
    }

    // Read all webp images
    const files = fs.readdirSync(productsDir);
    const images = files.filter(file => file.endsWith(".webp"));

    // Sort images naturally (img-1, img-2, ..., img-10 instead of img-1, img-10, img-2)
    images.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Error reading images directory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read images" },
      { status: 500 }
    );
  }
}
