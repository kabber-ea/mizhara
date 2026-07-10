export const INSTAGRAM_URL =
  import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";

export const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@mizhara.in";
