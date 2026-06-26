import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/&(?!lt;|gt;|quot;|#x27;)/g, "&amp;");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    const sanitized = products.map((p: unknown) => sanitizeValue(p));

    const seedPath = path.join(process.cwd(), "prisma", "seed-reales.json");
    fs.writeFileSync(seedPath, JSON.stringify(sanitized, null, 2));

    return NextResponse.json({ success: true, count: sanitized.length });
  } catch (error) {
    console.error("Error saving seed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save seed file" },
      { status: 500 }
    );
  }
}
