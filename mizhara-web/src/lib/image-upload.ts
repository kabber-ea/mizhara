export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const IMAGE_ACCEPT_LABEL = "JPG, PNG or WebP";
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = "10 MB";

export type CropPreset = {
  id: "card" | "bannerDesktop" | "bannerMobile";
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  label: string;
};

export const CROP_PRESETS = {
  card: {
    id: "card",
    aspect: 1,
    outputWidth: 800,
    outputHeight: 800,
    label: "800×800 square",
  },
  bannerDesktop: {
    id: "bannerDesktop",
    aspect: 21 / 9,
    outputWidth: 1680,
    outputHeight: 720,
    label: "1680×720 desktop",
  },
  bannerMobile: {
    id: "bannerMobile",
    aspect: 5 / 6,
    outputWidth: 1000,
    outputHeight: 1200,
    label: "1000×1200 mobile",
  },
} as const satisfies Record<string, CropPreset>;

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
