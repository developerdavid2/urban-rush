"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { RangeCalendar } from "@heroui/react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { cn } from "@/lib/utils";
import { EarningsAnalytics, EarningsPeriod } from "@/types/dashboard";

interface DashboardEarningsViewProps {
  earnings: EarningsAnalytics | undefined;
  isLoading?: boolean;
  period: EarningsPeriod;
  onPeriodChange: (period: EarningsPeriod) => void;
}

// Period options
const PERIOD_OPTIONS: Array<{ value: EarningsPeriod; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

// Custom Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: {
      period: string;
      revenue: number;
      sales: number;
      revenueOrders: number;
      totalOrders: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
      <p className="text-zinc-400 text-xs font-medium mb-1.5">{data.period}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-400">Sales:</span>
          </div>
          <span className="text-sm font-semibold text-white">
            ${data.sales.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-400">Revenue:</span>
          </div>
          <span className="text-sm font-semibold text-white">
            ${data.revenue.toLocaleString()}
          </span>
        </div>
        <div className="pt-1 mt-1 border-t border-zinc-700/50">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">Orders:</span>
            <span className="text-xs text-zinc-400">
              {data.revenueOrders} / {data.totalOrders}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardEarningsView({
  earnings,
  isLoading = false,
  period,
  onPeriodChange,
}: DashboardEarningsViewProps) {
  const [customDateRange, setCustomDateRange] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDateRange = () => {
    if (earnings?.startDate && earnings?.endDate) {
      const start = new Date(earnings.startDate).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(earnings.endDate).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      return `${start} to ${end}`;
    }
    return "Jan 31 to Feb 06";
  };

  return (
    <Card className="relative h-full bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
      {/* Gradient Background - Same as Stats Card */}
      <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-40 sm:size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] sm:blur-[140px] opacity-25 pointer-events-none" />

      <CardBody className="relative h-full flex flex-col p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Statistics</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Target you&apos;ve set for each month
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Tabs */}
            <div className="flex bg-zinc-800/70 rounded-lg p-1 border border-zinc-700/50">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onPeriodChange(option.value)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                    period === option.value
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Date Range Display with Calendar Popover */}
            <Popover
              isOpen={isCalendarOpen}
              onOpenChange={setIsCalendarOpen}
              placement="bottom-end"
            >
              <PopoverTrigger>
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/50 rounded-lg text-zinc-300 text-sm transition-colors">
                  <Calendar size={16} className="text-zinc-400" />
                  {formatDateRange()}
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-zinc-900 border border-zinc-700/50 p-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Select Custom Date Range
                  </h3>
                  <RangeCalendar
                    aria-label="Select date range"
                    value={customDateRange}
                    onChange={setCustomDateRange}
                    maxValue={today(getLocalTimeZone())}
                    classNames={{
                      base: "bg-transparent",
                      gridHeader: "text-zinc-400",
                      cellButton:
                        "text-zinc-200 data-[selected=true]:bg-emerald-600",
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => {
                        // TODO: Apply custom range
                        setIsCalendarOpen(false);
                      }}
                      isDisabled={!customDateRange}
                      className="flex-1 bg-emerald-600"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => {
                        setCustomDateRange(null);
                        setIsCalendarOpen(false);
                      }}
                      className="flex-1 border-zinc-700/50 text-zinc-300"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-[300px]">
          {isLoading ? (
            // Loading Skeleton for Chart Only
            <div className="h-full flex items-center justify-center">
              <div className="space-y-3 w-full">
                <div className="h-8 w-1/3 rounded bg-zinc-800 animate-pulse" />
                <div className="h-[calc(100%-3rem)] w-full rounded bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ) : !earnings || earnings.analytics.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <TrendingUp className="w-12 h-12 mb-4 text-zinc-600" />
              <p className="text-lg font-medium">No earnings data available</p>
              <p className="text-sm">Try selecting a different time period</p>
            </div>
          ) : (
            // Actual Chart
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={earnings.analytics}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    {/* Revenue Gradient (Green) */}
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.35}
                      />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    {/* Sales Gradient (Blue) */}
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.35}
                      />
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
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    label={{
                      value: "Amount ($)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#9ca3af", fontSize: 12 },
                    }}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#3b82f6",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "10px" }}
                    formatter={(value) => (
                      <span className="text-sm text-zinc-400">{value}</span>
                    )}
                  />

                  {/* Revenue Area (Bottom - Green) */}
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name="Revenue (Paid)"
                    activeDot={{
                      r: 6,
                      stroke: "#059669",
                      strokeWidth: 2,
                      fill: "#10b981",
                    }}
                  />

                  {/* Sales Area (Top - Blue) - Stacked */}
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorSales)"
                    name="Total Sales"
                    activeDot={{
                      r: 6,
                      stroke: "#1e40af",
                      strokeWidth: 2,
                      fill: "#3b82f6",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
