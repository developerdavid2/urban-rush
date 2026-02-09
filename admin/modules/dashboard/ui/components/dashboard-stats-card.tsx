// components/dashboard/DashboardStatsCard.tsx
"use client";

import { Card, CardBody } from "@heroui/card";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useId } from "react";

export type TrendType = "up" | "down" | "neutral";
export type TrendSentiment = "positive" | "negative" | "neutral";

export interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    type: TrendType;
    sentiment: TrendSentiment;
    label?: string;
  };
  iconColor?: string;
  chartData?: { value: number }[];
}

export function DashboardStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-white",
  chartData = [],
}: DashboardStatsCardProps) {
  const gradientId = useId();
  const getTrendColor = (sentiment: TrendSentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-danger";
      case "neutral":
        return "text-warning";
      default:
        return "text-text-secondary";
    }
  };

  const getChartColor = (sentiment?: TrendSentiment) => {
    switch (sentiment) {
      case "positive":
        return "#10b981";
      case "negative":
        return "#ef4444";
      case "neutral":
        return "#f59e0b";
      default:
        return "#10b981";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
        <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-30 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] sm:blur-[120px] opacity-35"></div>

        <CardBody className="p-6">
          {/* Header with Icon and Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-lg bg-zinc-800",
                  iconColor
                )}
              >
                <div className="flex items-center justify-center size-10 rounded-lg bg-zinc-800">
                  <Icon className={cn("size-5", iconColor)} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-text-secondary">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            {/* Value and Trend */}
            <div className="flex-1 min-w-0">
              {/* Value */}
              <div className="mb-3">
                <p className="text-3xl font-bold text-text-primary truncate">
                  {typeof value === "number"
                    ? value.toLocaleString()
                    : value || "0"}
                </p>
              </div>

              {/* Trend */}
              {trend && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5",
                      trend.sentiment === "positive" && "bg-success/10",
                      trend.sentiment === "negative" && "bg-danger/10",
                      trend.sentiment === "neutral" && "bg-warning/10"
                    )}
                  >
                    {trend.type === "up" && (
                      <TrendingUp
                        className={cn("size-3", getTrendColor(trend.sentiment))}
                      />
                    )}
                    {trend.type === "down" && (
                      <TrendingDown
                        className={cn("size-3", getTrendColor(trend.sentiment))}
                      />
                    )}
                    {trend.type === "neutral" && (
                      <Minus
                        className={cn("size-3", getTrendColor(trend.sentiment))}
                      />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getTrendColor(trend.sentiment)
                      )}
                    >
                      {Math.abs(trend.value)}%
                    </span>
                  </div>
                  {trend.label && (
                    <span className="text-xs text-text-muted truncate">
                      {trend.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mini Sparkline Chart */}
            {chartData.length > 0 && (
              <div className="w-24 h-16 -mb-2 -mr-2 shrink-0 mask-b-from-10%">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`gradient-${gradientId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={getChartColor(trend?.sentiment)}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={getChartColor(trend?.sentiment)}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor(trend?.sentiment)}
                      strokeWidth={2}
                      fill={getChartColor(trend?.sentiment)}
                      fillOpacity={0.1}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
