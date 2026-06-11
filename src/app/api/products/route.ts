import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "products.json");

async function getFileData() {
  const fileContent = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(fileContent);
}

async function writeFileData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const data = await getFileData();
    return NextResponse.json(data.products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const data = await getFileData();
    
    // Generate simple incremental ID or unique ID
    const newId = `prod-${Date.now()}`;
    const product = {
      id: newId,
      name: newProduct.name,
      description: newProduct.description || "",
      category: newProduct.category || "Rings",
      price: Number(newProduct.price) || 0,
      rating: 5.0,
      reviewsCount: 0,
      images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : ["/placeholder.jpg"],
      materials: newProduct.materials || ["Sterling Silver"],
      sizes: newProduct.sizes || ["One Size"],
      isFeatured: !!newProduct.isFeatured,
      inStock: true
    };
    
    data.products.push(product);
    await writeFileData(data);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProduct = await request.json();
    const data = await getFileData();
    
    const index = data.products.findIndex((p: any) => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Merge updates
    data.products[index] = {
      ...data.products[index],
      ...updatedProduct,
      price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : data.products[index].price,
      isFeatured: updatedProduct.isFeatured !== undefined ? !!updatedProduct.isFeatured : data.products[index].isFeatured
    };
    
    await writeFileData(data);
    return NextResponse.json(data.products[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    
    const data = await getFileData();
    const index = data.products.findIndex((p: any) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    const deletedProduct = data.products[index];
    data.products.splice(index, 1);
    await writeFileData(data);
    
    return NextResponse.json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
