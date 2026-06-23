import { NextResponse } from "next/server";
import { listProducts } from "@/services/products";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
