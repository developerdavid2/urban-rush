import {
  TrendSentiment,
  TrendType,
} from "@/modules/dashboard/ui/components/dashboard-stats-card";

export function calculateTrend(
  currentValue: number,
  previousValue: number,
  isPositiveGood: boolean = true
): {
  value: number;
  type: TrendType;
  sentiment: TrendSentiment;
} {
  // Handle edge cases
  if (previousValue === 0) {
    return {
      value: currentValue > 0 ? 100 : 0,
      type: currentValue > 0 ? "up" : "neutral",
      sentiment: currentValue > 0 && isPositiveGood ? "positive" : "neutral",
    };
  }

  const percentageChange =
    ((currentValue - previousValue) / previousValue) * 100;
  const absPercentage = Math.abs(percentageChange);

  let type: TrendType;
  if (Math.abs(percentageChange) < 0.1) {
    type = "neutral";
  } else if (percentageChange > 0) {
    type = "up";
  } else {
    type = "down";
  }

  let sentiment: TrendSentiment;
  if (type === "neutral") {
    sentiment = "neutral";
  } else if (type === "up") {
    sentiment = isPositiveGood ? "positive" : "negative";
  } else {
    sentiment = isPositiveGood ? "negative" : "positive";
  }

  return {
    value: Math.round(absPercentage * 10) / 10, // Round to 1 decimal place
    type,
    sentiment,
  };
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return value.toString();
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusConfig {
  label: string;
  color: "warning" | "info" | "secondary" | "success" | "danger";
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  const configs: Record<OrderStatus, OrderStatusConfig> = {
    pending: {
      label: "Pending",
      color: "warning",
      bgClass: "bg-warning/10",
      textClass: "text-warning",
      borderClass: "border-warning/20",
    },
    processing: {
      label: "Processing",
      color: "info",
      bgClass: "bg-info/10",
      textClass: "text-info",
      borderClass: "border-info/20",
    },
    shipped: {
      label: "Shipped",
      color: "secondary",
      bgClass: "bg-emerald-400/10",
      textClass: "text-emerald-400",
      borderClass: "border-emerald-400/20",
    },
    delivered: {
      label: "Delivered",
      color: "success",
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
    },
    cancelled: {
      label: "Cancelled",
      color: "danger",
      bgClass: "bg-danger/10",
      textClass: "text-danger",
      borderClass: "border-danger/20",
    },
  };

  return configs[status];
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface StockStatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export function getStockStatus(
  quantity: number,
  lowStockThreshold: number = 10
): StockStatus {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= lowStockThreshold) return "low-stock";
  return "in-stock";
}

export function getStockStatusConfig(status: StockStatus): StockStatusConfig {
  const configs: Record<StockStatus, StockStatusConfig> = {
    "in-stock": {
      label: "In Stock",
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
    },
    "low-stock": {
      label: "Low Stock",
      bgClass: "bg-warning/10",
      textClass: "text-warning",
      borderClass: "border-warning/20",
    },
    "out-of-stock": {
      label: "Out of Stock",
      bgClass: "bg-danger/10",
      textClass: "text-danger",
      borderClass: "border-danger/20",
    },
  };

  return configs[status];
}
