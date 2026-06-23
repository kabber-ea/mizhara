import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order, { type IOrderItem } from "@/models/Order";
import type { CustomerProfile, CustomerOrder, SavedAddress } from "@/types/account";

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  await dbConnect();
  const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
  if (!user || user.role !== "customer") return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    savedAddress: user.savedAddress
      ? {
          address: user.savedAddress.address,
          city: user.savedAddress.city,
          state: user.savedAddress.state,
          pincode: user.savedAddress.pincode,
        }
      : undefined,
  };
}

export async function updateCustomerProfile(
  userId: string,
  data: { name?: string; phone?: string; savedAddress?: SavedAddress }
) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || user.role !== "customer") return null;

  if (data.name?.trim()) {
    user.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    const normalized = data.phone.replace(/\D/g, "");
    if (normalized) {
      const existing = await User.findOne({ phone: normalized, _id: { $ne: userId } });
      if (existing) throw new Error("Mobile number already in use");
      user.phone = normalized;
    }
  }

  if (data.savedAddress) {
    user.savedAddress = {
      address: data.savedAddress.address?.trim() || undefined,
      city: data.savedAddress.city?.trim() || undefined,
      state: data.savedAddress.state?.trim() || undefined,
      pincode: data.savedAddress.pincode?.trim() || undefined,
    };
  }

  await user.save();

  return {
    userId: user._id.toString(),
    role: user.role as "customer",
    name: user.name,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
  };
}

export async function listCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  await dbConnect();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

  return orders.map((o) => ({
    id: String(o._id),
    orderNumber: o.orderNumber,
    items: o.items,
    itemCount: o.items.reduce((sum: number, i: IOrderItem) => sum + i.quantity, 0),
    total: o.total,
    paymentStatus: o.paymentStatus,
    deliveryStatus: o.deliveryStatus,
    trackingUrl: o.trackingUrl,
    trackingNumber: o.trackingNumber,
    trackingProvider: o.trackingProvider,
    createdAt: new Date(o.createdAt).toISOString(),
  }));
}
