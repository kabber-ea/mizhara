import dbConnect from "@/lib/db";
import Category from "@/models/Category";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function listCategoryNames() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories.map((c) => c.name);
}

export async function createCategory(name: string) {
  await dbConnect();
  const trimmed = name.trim();
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmed}$`, "i") },
  });
  if (existing) {
    throw new Error("Category already exists");
  }
  const created = await Category.create({ name: trimmed, slug: slugify(trimmed) });
  return created.name;
}

export async function deleteCategory(name: string) {
  await dbConnect();
  const deleted = await Category.findOneAndDelete({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });
  if (!deleted) return null;
  return deleted.name;
}
