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
    return NextResponse.json(data.categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { category } = await request.json();
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Valid category string is required" }, { status: 400 });
    }
    
    const cleanCategory = category.trim();
    const data = await getFileData();
    
    if (data.categories.some((c: string) => c.toLowerCase() === cleanCategory.toLowerCase())) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    
    data.categories.push(cleanCategory);
    await writeFileData(data);
    
    return NextResponse.json({ message: "Category added successfully", categories: data.categories }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
