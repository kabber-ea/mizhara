import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dbConnect from "../lib/db";
import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";
import Order from "../models/Order";
import { SEED_CATEGORIES } from "./seed/categories";
import {  PRODUCTS_PER_CATEGORY, SEED_PRODUCTS} from "./seed/products";
import { SEED_CUSTOMERS } from "./seed/customers";
import { buildSeedOrders } from "./seed/orders";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in .env");
  }

  await dbConnect();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mizhara.in";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";
  const customerEmail = process.env.CUSTOMER_EMAIL ?? "customer@mizhara.in";
  const customerPassword = process.env.CUSTOMER_PASSWORD ?? "Customer@123";
  const customerPhone = process.env.CUSTOMER_PHONE ?? "9876543210";

  console.log("Creating users...");
  const [adminHash, customerHash, ...extraHashes] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(customerPassword, 10),
    ...SEED_CUSTOMERS.map(() => bcrypt.hash("Customer@123", 10)),
  ]);

  const admin = await User.create({
    name: "Mizhara Admin",
    email: adminEmail.toLowerCase(),
    password: adminHash,
    role: "admin",
  });

  const demoCustomer = await User.create({
    name: "Demo Customer",
    email: customerEmail.toLowerCase(),
    phone: customerPhone.replace(/\D/g, ""),
    password: customerHash,
    role: "customer",
  });

  const extraCustomers = await User.insertMany(
    SEED_CUSTOMERS.map((c, i) => ({
      name: c.name,
      email: c.email.toLowerCase(),
      phone: c.phone.replace(/\D/g, ""),
      password: extraHashes[i],
      role: "customer" as const,
    }))
  );

  const allCustomers = [demoCustomer, ...extraCustomers];

  console.log("Creating categories...");
  await Category.insertMany(
    SEED_CATEGORIES.map((name) => ({ name, slug: slugify(name) }))
  );

  console.log(`Creating ${SEED_PRODUCTS.length} products...`);
  const products = await Product.insertMany(SEED_PRODUCTS);

  console.log("Creating seed orders...");
  const seedOrders = buildSeedOrders(
    allCustomers.map((c) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
    })),
    products
  );
  await Order.insertMany(seedOrders);

  console.log("Seed complete!");
  console.log(`  Admin:    ${adminEmail} / ${adminPassword}`);
  console.log(`  Customer: ${customerEmail} or ${customerPhone} / ${customerPassword}`);
  console.log(`  Customers: ${allCustomers.length} (including demo)`);
  console.log(`  Products: ${SEED_PRODUCTS.length} (${PRODUCTS_PER_CATEGORY} per category)`);
  console.log(`  Categories: ${SEED_CATEGORIES.length}`);
  console.log(`  Orders: ${seedOrders.length}`);
  for (const category of SEED_CATEGORIES) {
    const count = SEED_PRODUCTS.filter((p) => p.category === category).length;
    console.log(`    - ${category}: ${count}`);
  }

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
