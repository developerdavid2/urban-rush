// hooks/useDashboard.ts

import { dashboardApi } from "@/app/actions/dashboardApi";
import {
  EarningsQueryParams,
  GeographyQueryParams,
  LimitQueryParams,
  PaginationQueryParams,
} from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getDashboardStats,
  });
};

export const useEarningsAnalytics = (params?: EarningsQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", "earnings", params],
    queryFn: () => dashboardApi.getEarningsAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopProducts = (params?: LimitQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", "top-products", params],
    queryFn: () => dashboardApi.getTopProducts(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useGeographyAnalytics = (params?: GeographyQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", "geography", params],
    queryFn: () => dashboardApi.getGeographyAnalytics(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useTopCustomers = (params?: LimitQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", "top-customers", params],
    queryFn: () => dashboardApi.getTopCustomers(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useRecentOrders = (params?: PaginationQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", "recent-orders", params],
    queryFn: () => dashboardApi.getRecentOrders(params),
    staleTime: 2 * 60 * 1000,
  });
};
