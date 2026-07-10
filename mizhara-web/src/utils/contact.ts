import { WHATSAPP_NUMBER } from "@/constants/contact";

export function whatsappUrl(message = "Hi Mizhara, I have a question about your jewellery.") {
  if (!WHATSAPP_NUMBER) return "";
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;
}
