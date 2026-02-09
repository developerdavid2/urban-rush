"use client";
import {
  useDashboardStats,
  useEarningsAnalytics,
  useGeographyAnalytics,
  useRecentOrders,
  useTopCustomers,
  useTopProducts,
} from "@/hooks/useDashboard";
import { DashboardStatsSkeletonView } from "@/modules/dashboard/ui/components/dashboard-stats-loading";
import DashboardCustomersView from "@/modules/dashboard/ui/views/dashboard-customers-view";
import DashboardDemographyView from "@/modules/dashboard/ui/views/dashboard-demography-view";
import DashboardEarningsView from "@/modules/dashboard/ui/views/dashboard-earnings-view";
import DashboardOrdersView from "@/modules/dashboard/ui/views/dashboard-orders-view";
import DashboardProductsView from "@/modules/dashboard/ui/views/dashboard-products-view";
import { DashboardStatsView } from "@/modules/dashboard/ui/views/dashboard-stats-view";
import { EarningsPeriod, GeographyPeriod } from "@/types/dashboard";
import { useState } from "react";

export default function DashboardPage() {
  const [earningsPeriod, setEarningsPeriod] =
    useState<EarningsPeriod>("monthly");
  const [geographyPeriod, setGeographyPeriod] =
    useState<GeographyPeriod>("30days");

  // Fetch all dashboard data
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useDashboardStats();
  const { data: earnings, isLoading: earningsLoading } = useEarningsAnalytics({
    period: earningsPeriod,
  });
  const { data: topProducts, isLoading: isLoadingProducts } = useTopProducts({
    limit: 5,
  });
  const { data: geography, isLoading: isLoadingDemograph } =
    useGeographyAnalytics({
      period: geographyPeriod,
    });
  const { data: topCustomers, isLoading: isLoadingCustomers } = useTopCustomers(
    { limit: 10 }
  );
  const { data: recentOrders, isLoading: isLoadingOrders } = useRecentOrders({
    limit: 10,
    page: 1,
  });

  console.log("Earnings", earnings);

  return (
    <div className="space-y-6 p-6">
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
      {isLoadingStats && <DashboardStatsSkeletonView />}

      {/* Success State */}
      {!isLoadingStats && !isErrorStats && stats?.data && (
        <DashboardStatsView stats={stats.data} />
      )}

      {/* Error State */}
      {!isLoadingStats && isErrorStats && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 p-6">
          <h3 className="text-lg font-semibold text-danger mb-2">
            Failed to Load Dashboard Stats
          </h3>
          <p className="text-sm text-text-secondary">
            An error occurred while fetching dashboard data. Please try again.
          </p>
        </div>
      )}

      {/* BENTO GRID LAYOUT CHART */}

      {/* GROUP 1  2 COL - 70 to 30 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6 w-full">
        <div className="group relative overflow-hidden rounded-xl h-[500px] lg:col-span-8">
          <DashboardEarningsView
            earnings={earnings?.data}
            isLoading={earningsLoading}
            period={earningsPeriod}
            onPeriodChange={setEarningsPeriod}
          />
        </div>

        <div className="group relative overflow-hidden rounded-xl lg:col-span-4 flex-1 h-[500px]">
          <DashboardProductsView
            data={topProducts?.data}
            isLoading={isLoadingProducts}
          />
        </div>

        {/* GROUP 2 - 2COL 60 to 40 */}

        {/* Customer Demograghy Chart plus top countries ranking  */}
        <div className="group relative overflow-hidden rounded-xl h-full lg:col-span-8">
          <DashboardDemographyView
            data={geography?.data}
            isLoading={isLoadingDemograph}
            period={geographyPeriod}
            onPeriodChange={setGeographyPeriod}
          />
        </div>
        <div className="group relative overflow-hidden rounded-xl lg:col-span-4">
          {/* Top Customers List with amount spent */}
          <DashboardCustomersView
            data={topCustomers?.data}
            isLoading={isLoadingCustomers}
          />
        </div>

        {/* GROUP 3  -100%*/}
        {/* Recent Orders table */}
        <div className="w-full col-span-full h-[600px] rounded-xl">
          <DashboardOrdersView
            data={recentOrders?.data}
            isLoading={isLoadingOrders}
          />
        </div>
      </div>
    </div>
  );
}
