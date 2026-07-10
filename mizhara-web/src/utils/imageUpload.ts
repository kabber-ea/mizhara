import {
  CROP_PRESETS,
  IMAGE_ACCEPT,
  IMAGE_ACCEPT_LABEL,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
} from "@/constants/imageUpload";

export type { CropPreset } from "@/constants/imageUpload";
export {
  CROP_PRESETS,
  IMAGE_ACCEPT,
  IMAGE_ACCEPT_LABEL,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
} from "@/constants/imageUpload";

export function validateImageFile(file: File): string | null {
  const allowed = IMAGE_ACCEPT.split(",");
  if (!allowed.includes(file.type)) {
    return `Please choose a ${IMAGE_ACCEPT_LABEL} image.`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller.`;
  }
  return null;
}

export function imageUploadHint(preset: keyof typeof CROP_PRESETS = "card"): string {
  const crop = CROP_PRESETS[preset];
  return `${IMAGE_ACCEPT_LABEL} · Max ${MAX_IMAGE_SIZE_LABEL} · Saved as ${crop.label}`;
}

export function hasFeaturedBanners(
  bannerDesktop: string,
  bannerMobile: string,
  pendingDesktop: boolean,
  pendingMobile: boolean,
): boolean {
  const hasDesktop = Boolean(bannerDesktop) || pendingDesktop;
  const hasMobile = Boolean(bannerMobile) || pendingMobile;
  return hasDesktop && hasMobile;
}
