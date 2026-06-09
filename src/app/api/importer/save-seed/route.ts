import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Guardar en prisma/seed-reales.json
    const seedPath = path.join(process.cwd(), "prisma", "seed-reales.json");
    fs.writeFileSync(seedPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ success: true, count: products.length });
  } catch (error) {
    console.error("Error saving seed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save seed file" },
      { status: 500 }
    );
  }
}
