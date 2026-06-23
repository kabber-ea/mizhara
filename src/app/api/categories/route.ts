import { NextResponse } from "next/server";
import { listCategoryNames } from "@/services/categories";

export async function GET() {
  try {
    const categories = await listCategoryNames();
    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
