// app/dashboard/page.tsx
"use client";

import { DashboardStatsSkeletonView } from "@/modules/dashboard/ui/components/dashboard-stats-loading";
import { DashboardStatsView } from "@/modules/dashboard/ui/views/dashboard-stats-view";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { getToken } = useAuth();

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      // Get Clerk token
      const token = await getToken();

      console.log("🔑 Token exists:", !!token);
      console.log("🔑 Token preview:", token?.substring(0, 30) + "...");

      // Hardcoded fetch
      const response = await fetch(
        "https://urban-rush.onrender.com/api/v1/orders/dashboard/stats",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      console.log("📊 Response status:", response.status);
      console.log("📊 Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Success data:", data);
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </p>
        </div>
      </header>

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
    </div>
  );
}
