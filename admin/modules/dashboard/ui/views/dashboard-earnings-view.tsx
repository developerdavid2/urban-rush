"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/dashboard-utils";
import { EarningsAnalytics, EarningsPeriod } from "@/types/dashboard";

interface DashboardEarningsViewProps {
  earnings: EarningsAnalytics | undefined;
  isLoading?: boolean;
  period: EarningsPeriod;
  onPeriodChange: (period: EarningsPeriod) => void;
}

export default function DashboardEarningsView({
  earnings,
  isLoading = false,
  period,
  onPeriodChange,
}: DashboardEarningsViewProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 animate-pulse">
        Loading earnings data...
      </div>
    );
  }

  if (!earnings || earnings.analytics.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        No earnings data available for this period
      </div>
    );
  }

  const data = earnings.analytics;

  // Format month label (short)
  const formatPeriodLabel = (periodStr: string) => {
    // Assuming period is like "Feb", "Jan 2026", etc.
    return periodStr.length <= 3 ? periodStr : periodStr.split(" ")[0];
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
          <p className="text-zinc-400 text-xs font-medium mb-1.5">{label}</p>
          <p className="text-white text-lg font-semibold">
            {formatCurrency(point.revenue)}
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            {point.totalOrders || 0} orders
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-full rounded-xl bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
      {/* Subtle gradient blur background */}
      <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-40 sm:size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] sm:blur-[140px] opacity-25 pointer-events-none" />

      <div className="relative h-full flex flex-col p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Statistics</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Target you've set for each month
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Tabs */}
            <div className="flex bg-zinc-800/70 rounded-lg p-1 border border-zinc-700/50">
              {(["monthly", "quarterly", "annually"] as EarningsPeriod[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                      period === p
                        ? "bg-zinc-700 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Date Range Placeholder */}
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/50 rounded-lg text-zinc-300 text-sm transition-colors">
              <CalendarIcon size={16} className="text-zinc-400" />
              {earnings.startDate && earnings.endDate
                ? `${new Date(earnings.startDate).toLocaleDateString(
                    "default",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )} to ${new Date(earnings.endDate).toLocaleDateString(
                    "default",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}`
                : "Jan 31 to Feb 06"}
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="period"
                tickFormatter={formatPeriodLabel}
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                tickFormatter={(val) => formatCurrency(val).replace("$", "")}
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#3b82f6",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 6,
                  stroke: "#1e40af",
                  strokeWidth: 2,
                  fill: "#3b82f6",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
