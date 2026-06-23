import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import type { ProductInput, SerializedProduct } from "@/types/catalog";

function serializeProduct(doc: Record<string, unknown>): SerializedProduct {
  return {
    id: String(doc._id),
    name: doc.name as string,
    description: doc.description as string,
    category: doc.category as string,
    price: doc.price as number,
    rating: doc.rating as number,
    reviewsCount: doc.reviewsCount as number,
    images: doc.images as string[],
    materials: doc.materials as string[],
    sizes: doc.sizes as string[],
    isFeatured: doc.isFeatured as boolean,
    inStock: doc.inStock as boolean,
  };
}

export async function listProducts() {
  await dbConnect();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return products.map((p) => serializeProduct(p as Record<string, unknown>));
}

export async function getFeaturedProducts(limit = 4) {
  try {
    await dbConnect();
    const products = await Product.find({ isFeatured: true, inStock: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return products.map((p) => serializeProduct(p as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getProductById(id: string) {
  await dbConnect();
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return serializeProduct(product as Record<string, unknown>);
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4) {
  await dbConnect();
  const filter: Record<string, unknown> = { category, inStock: true };
  if (mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }
  const products = await Product.find(filter).limit(limit).lean();
  return products.map((p) => serializeProduct(p as Record<string, unknown>));
}

export async function createProduct(body: ProductInput) {
  await dbConnect();
  const product = await Product.create({
    name: body.name,
    description: body.description || "",
    category: body.category,
    price: Number(body.price),
    materials: body.materials || [],
    sizes: body.sizes?.length ? body.sizes : ["One Size"],
    images: body.images || [],
    isFeatured: !!body.isFeatured,
    inStock: body.inStock !== false,
    rating: body.rating ?? 4.5,
    reviewsCount: body.reviewsCount ?? 0,
  });
  return serializeProduct(product.toObject() as Record<string, unknown>);
}

export async function updateProduct(body: ProductInput & { id: string }) {
  await dbConnect();
  const product = await Product.findByIdAndUpdate(
    body.id,
    {
      name: body.name,
      description: body.description,
      category: body.category,
      price: Number(body.price),
      materials: body.materials,
      sizes: body.sizes,
      images: body.images,
      isFeatured: !!body.isFeatured,
      inStock: body.inStock !== false,
    },
    { new: true }
  );
  if (!product) return null;
  return serializeProduct(product.toObject() as Record<string, unknown>);
}

export async function deleteProduct(id: string) {
  await dbConnect();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return null;
  return serializeProduct(product.toObject() as Record<string, unknown>);
}
