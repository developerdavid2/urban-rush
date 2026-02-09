// types/dashboard.ts

import { Order } from "./order";

// Stats Card Types
export interface DashboardStats {
  revenue: { current: number; previous: number };
  orders: { current: number; previous: number };
  customers: { current: number; previous: number };
  products: { current: number; previous: number };
}

// Earnings Analytics Types
export interface EarningsDataPoint {
  period: string;
  revenue: number;
  sales: number;
  revenueOrders: number;
  totalOrders: number;
}

export interface EarningsAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  analytics: EarningsDataPoint[];
}

// Top Products Types
export interface TopProduct {
  productId: string;
  name: string;
  image: string;
  totalQuantitySold: number;
  totalRevenue: number;
  numberOfOrders: number;
  currentStock: number;
  category: string;
}

export interface TopProductsTotals {
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
}

export interface TopProductsData {
  products: TopProduct[];
  totals: TopProductsTotals;
}

// Geography Analytics Types
export interface CountryData {
  country: string;
  totalRevenue: number;
  orderCount: number;
  customerCount: number;
  percentage: string;
  revenuePerCustomer: string;
}

export interface GeographyTotals {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  percentageOfGlobal: string;
}

export interface GeographyAnalytics {
  period: string;
  countries: CountryData[];
  top5Totals: GeographyTotals;
  globalRevenue: number;
}

// Top Customers Types
export interface TopCustomer {
  customerId: string;
  clerkId: string;
  name: string;
  email: string;
  image: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  avgOrderValue: number;
  lifetimeValue: number;
}

export interface TopCustomersTotals {
  totalRevenue: number;
  totalOrders: number;
  avgCustomerValue: string;
}

export interface TopCustomersData {
  customers: TopCustomer[];
  totals: TopCustomersTotals;
}

// Recent Orders Types
export interface RecentOrdersPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  ordersPerPage: number;
}

export interface RecentOrdersData {
  orders: Order[]; // Use your existing Order type
  pagination: RecentOrdersPagination;
}

// Query Parameters Types
export type EarningsPeriod = "monthly" | "quarterly" | "annually";
export type GeographyPeriod = "7days" | "30days";

export interface EarningsQueryParams {
  period?: EarningsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface GeographyQueryParams {
  period?: GeographyPeriod;
}

export interface LimitQueryParams {
  limit?: number;
}

export interface PaginationQueryParams {
  limit?: number;
  page?: number;
}
