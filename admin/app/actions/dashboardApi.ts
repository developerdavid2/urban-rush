// app/actions/dashboardApi.ts

import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  EarningsAnalytics,
  EarningsQueryParams,
  GeographyAnalytics,
  GeographyQueryParams,
  TopProductsData,
  TopCustomersData,
  RecentOrdersData,
  LimitQueryParams,
  PaginationQueryParams,
  DashboardStats,
} from "@/types/dashboard";

export const dashboardApi = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const { data } = await axiosClient.get("/api/v1/orders/dashboard/stats");
    return data;
  },

  getEarningsAnalytics: async (
    params?: EarningsQueryParams
  ): Promise<ApiResponse<EarningsAnalytics>> => {
    const { data } = await axiosClient.get(
      "/api/v1/orders/dashboard/earnings",
      {
        params,
      }
    );
    return data;
  },

  getTopProducts: async (
    params?: LimitQueryParams
  ): Promise<ApiResponse<TopProductsData>> => {
    const { data } = await axiosClient.get(
      "/api/v1/orders/dashboard/top-products",
      {
        params: {
          limit: params?.limit || 5,
        },
      }
    );
    return data;
  },

  getGeographyAnalytics: async (
    params?: GeographyQueryParams
  ): Promise<ApiResponse<GeographyAnalytics>> => {
    const { data } = await axiosClient.get(
      "/api/v1/orders/dashboard/geography",
      {
        params: {
          period: params?.period || "30days",
        },
      }
    );
    return data;
  },

  getTopCustomers: async (
    params?: LimitQueryParams
  ): Promise<ApiResponse<TopCustomersData>> => {
    const { data } = await axiosClient.get(
      "/api/v1/orders/dashboard/top-customers",
      {
        params: {
          limit: params?.limit || 10,
        },
      }
    );
    return data;
  },

  getRecentOrders: async (
    params?: PaginationQueryParams
  ): Promise<ApiResponse<RecentOrdersData>> => {
    const { data } = await axiosClient.get("/api/v1/orders/dashboard/recent", {
      params: {
        limit: params?.limit || 10,
        page: params?.page || 1,
      },
    });
    return data;
  },
};
