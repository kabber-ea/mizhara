import { uploadImage } from "@/lib/cloudinary";

export async function uploadProductImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  return uploadImage(dataUri);
}
