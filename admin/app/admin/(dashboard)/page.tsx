"use client";
import { orderApi } from "@/app/actions/orderApi";
import { DashboardStatsSkeletonView } from "@/modules/dashboard/ui/components/dashboard-stats-loading";
import { DashboardStatsView } from "@/modules/dashboard/ui/views/dashboard-stats-view";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: orderApi.getDashboardStats,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </p>
        </div>
      </div>

      {isLoading ? (
        <DashboardStatsSkeletonView />
      ) : (
        <DashboardStatsView stats={stats.data} />
      )}

      {/* Charts Section - Coming Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart will go here */}
      </div>
    </div>
  );
}
