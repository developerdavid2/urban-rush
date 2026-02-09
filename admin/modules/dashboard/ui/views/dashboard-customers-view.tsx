"use client";

import { cn } from "@/lib/utils";
import { TopCustomersData } from "@/types/dashboard";
import { Card, CardBody } from "@heroui/card";
import { Avatar, Button } from "@heroui/react";
import { ArrowRight, Crown, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardCustomersViewProps {
  data?: TopCustomersData;
  isLoading?: boolean;
}

export default function DashboardCustomersView({
  data,
  isLoading = false,
}: DashboardCustomersViewProps) {
  const router = useRouter();

  const customers = data?.customers.slice(0, 5) || [];

  return (
    <Card className="relative h-full bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-40 sm:size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] sm:blur-[140px] opacity-25 pointer-events-none" />

      <CardBody className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800/50">
              <Users className="size-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Top Customers</h3>
          </div>
          <Button
            size="sm"
            variant="light"
            endContent={<ArrowRight className="size-4" />}
            onPress={() => router.push("/admin/customers")}
            className="text-zinc-400 hover:text-white"
          >
            See all
          </Button>
        </div>

        {/* Customers List */}
        <div className="flex-1 overflow-auto space-y-3">
          {isLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
              >
                <div className="size-10 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-zinc-800" />
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                </div>
                <div className="h-5 w-16 rounded bg-zinc-800" />
              </div>
            ))
          ) : customers.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Users className="size-12 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-500">
                No customers data available
              </p>
            </div>
          ) : (
            // Customer items
            customers.map((customer, index) => (
              <div
                key={customer.customerId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "bg-zinc-800/30 hover:bg-zinc-800/50",
                  "border border-zinc-700/30 hover:border-zinc-600/50",
                  "transition-all duration-200 cursor-pointer",
                  index === 0 && "border-yellow-500/30 bg-yellow-500/5"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar
                    showFallback
                    name={customer?.name}
                    src={customer?.image}
                    color="success"
                    size="sm"
                    className="border-2 ring-2 ring-emerald-600"
                  />
                  {/* Crown for top customer */}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 size-4 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Crown className="size-2.5 text-yellow-900 fill-yellow-900" />
                    </div>
                  )}
                  {/* Rank Badge */}
                  {index !== 0 && (
                    <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {customer.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-400">
                      {customer.orderCount}{" "}
                      {customer.orderCount === 1 ? "Purchase" : "Purchases"}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                      {customer.email}
                    </span>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-emerald-500">
                    ${customer.totalSpent.toLocaleString()}
                  </p>
                  <span className="text-xs text-zinc-500">
                    Avg: ${customer.avgOrderValue.toFixed(0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && data && customers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
                <p className="text-lg font-bold text-white">
                  ${data.totals.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Avg Customer Value</p>
                <p className="text-lg font-bold text-white">
                  ${parseFloat(data.totals.avgCustomerValue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
