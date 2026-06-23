import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAppUrl, sendEmail } from "@/lib/email";
import type { SessionPayload } from "@/lib/jwt";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function authenticate(
  identifier: string,
  password: string
): Promise<SessionPayload | null> {
  await dbConnect();

  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");

  const user = await User.findOne({
    ...(isEmail ? { email: trimmed.toLowerCase() } : { phone: trimmed.replace(/\D/g, "") }),
  });

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return {
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
  };
}

export async function registerUser(input: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}) {
  await dbConnect();

  const normalizedEmail = input.email?.trim().toLowerCase();
  const normalizedPhone = input.phone?.replace(/\D/g, "");

  if (normalizedEmail) {
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) throw new Error("Email already registered");
  }

  if (normalizedPhone) {
    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) throw new Error("Mobile number already registered");
  }

  const hashed = await bcrypt.hash(input.password, 10);

  await User.create({
    name: input.name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone || undefined,
    password: hashed,
    role: "customer",
  });
}

export async function requestPasswordReset(email: string, role: "customer" | "admin") {
  await dbConnect();

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    role,
  });

  const genericMessage =
    "If an account exists with this email, you will receive a password reset link shortly.";

  if (!user) {
    return { message: genericMessage };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetPath = role === "admin" ? "/admin/reset-password" : "/reset-password";
  const resetUrl = `${getAppUrl()}${resetPath}?token=${rawToken}`;

  const emailResult = await sendEmail({
    to: user.email!,
    subject: "Reset your Mizhara password",
    html: `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your Mizhara password.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });

  const response: Record<string, string> = { message: genericMessage };
  if (!emailResult.sent && process.env.NODE_ENV === "development") {
    response.devResetUrl = resetUrl;
    console.log("[dev] Password reset link:", resetUrl);
  }

  return response;
}

export async function resetPassword(
  token: string,
  password: string,
  role: "customer" | "admin"
) {
  await dbConnect();

  const user = await User.findOne({
    role,
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset link");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
}
