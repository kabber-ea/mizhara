export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPincode(value: string) {
  return /^[0-9]{6}$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

export function isPositiveNumber(value: string) {
  const n = Number(value);
  return value.trim() !== "" && !Number.isNaN(n) && n > 0;
}

export function isNonNegativeInt(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= 0;
}

