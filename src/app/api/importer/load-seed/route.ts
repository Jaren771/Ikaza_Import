import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const seedPath = path.join(process.cwd(), "prisma", "seed-reales.json");
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json({ success: false, error: "Archivo seed no encontrado" });
    }

    const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    return NextResponse.json({ success: true, products: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
