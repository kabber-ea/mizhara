import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "admin" | "customer";

export interface ISavedAddress {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface IUser {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  savedAddress?: ISavedAddress;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], required: true },
    savedAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
