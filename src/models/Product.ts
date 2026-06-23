import mongoose, { Schema, models, model } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  materials: string[];
  sizes: string[];
  isFeatured: boolean;
  inStock: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    sizes: { type: [String], default: ["One Size"] },
    isFeatured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
