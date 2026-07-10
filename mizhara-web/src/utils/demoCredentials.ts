export { DEMO_ACCOUNTS } from "@/constants/demoAccounts";

export function maskPassword(password: string) {
  return "*".repeat(Math.max(password.length, 8));
}
