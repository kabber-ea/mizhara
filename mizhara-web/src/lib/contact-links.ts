export const INSTAGRAM_URL =
  import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";

export const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@mizhara.in";

export function whatsappUrl(message = "Hi Mizhara, I have a question about your jewellery.") {
  if (!WHATSAPP_NUMBER) return "";
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;
}
