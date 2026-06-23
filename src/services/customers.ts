import dbConnect from "@/lib/db";
import User from "@/models/User";
import { buildPaginationMeta } from "@/lib/pagination";
import type { SerializedCustomer } from "@/types/admin";

function serializeCustomer(doc: Record<string, unknown>): SerializedCustomer {
  return {
    id: String(doc._id),
    name: doc.name as string,
    email: doc.email as string | undefined,
    phone: doc.phone as string | undefined,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    orderCount: (doc.orderCount as number) ?? 0,
    totalSpent: (doc.totalSpent as number) ?? 0,
  };
}

const customerPipeline = [
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders",
    },
  },
  {
    $addFields: {
      orderCount: { $size: "$orders" },
      totalSpent: {
        $sum: {
          $map: {
            input: {
              $filter: {
                input: "$orders",
                as: "o",
                cond: { $eq: ["$$o.paymentStatus", "paid"] },
              },
            },
            as: "paid",
            in: "$$paid.total",
          },
        },
      },
    },
  },
  { $project: { orders: 0, password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 } },
];

export async function listCustomers(params: {
  page: number;
  limit: number;
  skip: number;
  search: string;
}) {
  await dbConnect();

  const match: Record<string, unknown> = { role: "customer" };
  if (params.search) {
    const regex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const pipeline = [{ $match: match }, ...customerPipeline, { $sort: { createdAt: -1 as const } }];

  const countResult = await User.aggregate([...pipeline, { $count: "total" }]);
  const total = countResult[0]?.total ?? 0;

  const customers = await User.aggregate([
    ...pipeline,
    { $skip: params.skip },
    { $limit: params.limit },
  ]);

  return {
    items: customers.map((c) => serializeCustomer(c as Record<string, unknown>)),
    pagination: buildPaginationMeta(params.page, params.limit, total),
  };
}

export async function getRecentCustomers(limit = 5) {
  await dbConnect();
  const customers = await User.aggregate([
    { $match: { role: "customer" } },
    ...customerPipeline,
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);
  return customers.map((c) => serializeCustomer(c as Record<string, unknown>));
}
