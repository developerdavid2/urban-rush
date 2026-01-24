"use client";
import { orderApi } from "@/app/actions/orderApi";
import { DashboardStatsSkeletonView } from "@/modules/dashboard/ui/components/dashboard-stats-loading";
import { DashboardStatsView } from "@/modules/dashboard/ui/views/dashboard-stats-view";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
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

      {/* Loading State */}
      {isLoading && <DashboardStatsSkeletonView />}

      {/* Success State */}
      {!isLoading && !isError && stats?.data && (
        <DashboardStatsView stats={stats.data} />
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 p-6">
          <h3 className="text-lg font-semibold text-danger mb-2">
            Failed to Load Dashboard Stats
          </h3>
          <p className="text-sm text-text-secondary">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching dashboard data. Please try again."}
          </p>
        </div>
      )}

      {/* Charts Section - Coming Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart will go here */}
      </div>
    </div>
  );
}
