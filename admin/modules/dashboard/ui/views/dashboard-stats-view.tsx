"use client";

import {
  DollarSignIcon,
  ShoppingCartIcon,
  UsersIcon,
  PackageIcon,
} from "lucide-react";
import { calculateTrend, formatCurrency } from "@/lib/dashboard-utils";
import { DashboardStatsCard } from "@/modules/dashboard/ui/components/dashboard-stats-card";

// Generate sample chart data (last 7 days)
const generateChartData = (base: number, volatility: number = 0.2) => {
  return Array.from({ length: 7 }, (_, i) => ({
    value: base * (1 + (Math.random() - 0.5) * volatility),
  }));
};

export function DashboardStatsView({
  stats,
}: {
  stats: {
    revenue: { current: number; previous: number };
    orders: { current: number; previous: number };
    customers: { current: number; previous: number };
    products: { current: number; previous: number };
  };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <DashboardStatsCard
        title="Total Revenue"
        value={formatCurrency(stats.revenue.current)}
        icon={DollarSignIcon}
        iconColor="text-emerald-500"
        trend={{
          ...calculateTrend(
            stats.revenue.current,
            stats.revenue.previous,
            true
          ),
          label: "vs last month",
        }}
        chartData={generateChartData(stats.revenue.current, 0.15)}
      />

      {/* Total Orders */}
      <DashboardStatsCard
        title="Total Orders"
        value={stats.orders.current || 0}
        icon={ShoppingCartIcon}
        iconColor="text-emerald-400"
        trend={{
          ...calculateTrend(stats.orders.current, stats.orders.previous, true),
          label: "vs last month",
        }}
        chartData={generateChartData(stats.orders.current, 0.3)}
      />

      {/* Total Customers */}
      <DashboardStatsCard
        title="Total Customers"
        value={stats.customers.current || 0}
        icon={UsersIcon}
        iconColor="text-emerald-500"
        trend={{
          ...calculateTrend(
            stats.customers.current,
            stats.customers.previous,
            true
          ),
          label: "vs last month",
        }}
        chartData={generateChartData(stats.customers.current, 0.25)}
      />

      {/* Total Products */}
      <DashboardStatsCard
        title="Total Products"
        value={stats.products.current || 0}
        icon={PackageIcon}
        iconColor="text-emerald-400"
        trend={{
          ...calculateTrend(
            stats.products.current,
            stats.products.previous,
            true
          ),
          label: "vs last month",
        }}
        chartData={generateChartData(stats.products.current, 0.1)}
      />
    </div>
  );
}
