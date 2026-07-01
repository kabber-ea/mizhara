export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPincode(value: string) {
  return /^[0-9]{6}$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

/** Parse user-entered currency (handles ₹, spaces, Indian grouping, decimal comma). */
export function parseAmountInput(value: string): number | null {
  let s = value.trim().replace(/[₹\s]/g, "");
  if (!s) return null;

  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/,/g, "");
  } else if (s.includes(",") && !s.includes(".")) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      s = `${parts[0]}.${parts[1]}`;
    } else {
      s = s.replace(/,/g, "");
    }
  }

  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function isPositiveNumber(value: string) {
  return parseAmountInput(value) !== null;
}

export function parseNonNegativeAmountInput(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = parseAmountInput(value);
  if (parsed !== null) return parsed;
  const n = Number(value.trim().replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function isNonNegativeAmount(value: string) {
  if (!value.trim()) return true;
  return parseNonNegativeAmountInput(value) !== null;
}

export function isNonNegativeInt(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= 0;
}

