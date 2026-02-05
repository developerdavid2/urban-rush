import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

// ✅ React Native compatible - returns actual hex colors
export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  const configs: Record<OrderStatus, OrderStatusConfig> = {
    pending: {
      label: "Pending",
      color: "#F59E0B",
      bgColor: "#F59E0B33",
    },
    processing: {
      label: "Processing",
      color: "#3B82F6",
      bgColor: "#3B82F633",
    },
    shipped: {
      label: "Shipped",
      color: "#34D399",
      bgColor: "#34D39933",
    },
    delivered: {
      label: "Delivered",
      color: "#10B981",
      bgColor: "#10B98133",
    },
    cancelled: {
      label: "Cancelled",
      color: "#EF4444",
      bgColor: "#EF444433",
    },
  };

  return configs[status];
}
