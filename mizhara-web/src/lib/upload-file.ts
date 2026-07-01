import { api } from "@/lib/api";

export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ url: string }>("/api/upload", formData);
  const url = data.url?.trim();
  if (!url) {
    throw new Error("Image upload failed — server returned an empty URL.");
  }
  return url;
}
