import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { listCategoryNames, createCategory } from "@/services/categories";

export async function GET() {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const categories = await listCategoryNames();
    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const { category } = await request.json();
    if (!category?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const name = await createCategory(category);
    return NextResponse.json(name, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add category";
    const status = message === "Category already exists" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
