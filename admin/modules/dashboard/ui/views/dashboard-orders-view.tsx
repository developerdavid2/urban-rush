"use client";

import { Card, CardBody } from "@heroui/card";
import { Button, Chip, Avatar, AvatarGroup } from "@heroui/react";
import { ArrowRight, ShoppingBag, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecentOrdersData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Order } from "@/types/order";
import {
  getOrderStatusConfig,
  getPaymentStatusConfig,
} from "@/lib/dashboard-utils";

interface DashboardOrdersViewProps {
  data?: RecentOrdersData;
  isLoading?: boolean;
}

export default function DashboardOrdersView({
  data,
  isLoading = false,
}: DashboardOrdersViewProps) {
  const router = useRouter();

  const orders = (data?.orders.slice(0, 10) || []) as Order[];

  return (
    <Card className="relative h-full bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[140px] opacity-25 pointer-events-none" />

      <CardBody className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800/50">
              <ShoppingBag className="size-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          </div>
          <Button
            size="sm"
            variant="light"
            endContent={<ArrowRight className="size-4" />}
            onPress={() => router.push("/admin/orders")}
            className="text-zinc-400 hover:text-white"
          >
            See all
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg animate-pulse"
                  >
                    <div className="h-10 w-24 rounded bg-zinc-800" />
                    <div className="h-10 w-32 rounded bg-zinc-800" />
                    <div className="flex-1 h-10 rounded bg-zinc-800" />
                    <div className="h-10 w-24 rounded bg-zinc-800" />
                    <div className="h-10 w-20 rounded bg-zinc-800" />
                    <div className="h-10 w-20 rounded bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="size-12 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">No recent orders</p>
              </div>
            ) : (
              // Table Content
              <div className="space-y-2">
                {/* Table Header */}
                <div className=" absolute inset-x-0 top-18 mx-6 z-20 backdrop-blur-xl grid grid-cols-[100px_200px_1fr_120px_100px_100px_120px] gap-4 px-4 py-2 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Order ID
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Customer
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Products
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Total
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Payment
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Status
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase">
                    Date
                  </div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2 mt-10">
                  {orders.map((order) => {
                    const paymentStatus = getPaymentStatusConfig(
                      order.paymentStatus
                    );

                    const orderStatus = getOrderStatusConfig(order.orderStatus);
                    return (
                      <div
                        key={order._id}
                        className={cn(
                          "grid grid-cols-[100px_200px_1fr_120px_100px_100px_120px] gap-4 px-4 py-3",
                          "bg-zinc-800/20 hover:bg-zinc-800/40",
                          "border border-zinc-700/20 hover:border-zinc-600/40",
                          "rounded-lg transition-all duration-200 cursor-pointer"
                        )}
                        onClick={() =>
                          router.push(`/admin/orders/${order._id}`)
                        }
                      >
                        {/* Order ID */}
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-mono text-white">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          {order.paymentIntentId && (
                            <p className="text-xs text-zinc-500 truncate">
                              PI: {order.paymentIntentId.slice(-6)}
                            </p>
                          )}
                        </div>

                        {/* Customer */}
                        <div className="flex flex-col justify-center min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {typeof order.userId === "object"
                              ? order.userId.name
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {typeof order.userId === "object"
                              ? order.userId.email
                              : ""}
                          </p>
                        </div>

                        {/* Products */}
                        <div className="flex items-center gap-2">
                          <AvatarGroup max={3} size="sm" className="shrink-0">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <Avatar
                                key={idx}
                                src={item.image}
                                name={item.name}
                                className="size-8"
                                fallback={
                                  <Package className="size-4 text-zinc-400" />
                                }
                              />
                            ))}
                          </AvatarGroup>
                          <span className="text-xs text-zinc-400">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center">
                          <p className="text-sm font-bold text-white">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center">
                          <Chip
                            size="sm"
                            classNames={{
                              base: `capitalize border ${paymentStatus.borderClass} ${paymentStatus.bgClass}`,
                              content: `${paymentStatus.textClass} font-medium`,
                            }}
                            variant="flat"
                          >
                            {order.paymentStatus}
                          </Chip>
                        </div>

                        {/* Order Status */}
                        <div className="flex items-center">
                          <Chip
                            size="sm"
                            classNames={{
                              base: `capitalize border ${orderStatus.borderClass} ${orderStatus.bgClass}`,
                              content: `${orderStatus.textClass} font-medium`,
                            }}
                            variant="flat"
                          >
                            {order.orderStatus}
                          </Chip>
                        </div>

                        {/* Date */}
                        <div className="flex flex-col justify-center">
                          <p className="text-xs text-zinc-400">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Pagination Info */}
        {!isLoading && data && orders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing {orders.length} of {data.pagination.totalOrders} orders
            </p>
            <Button
              size="sm"
              variant="bordered"
              endContent={<ArrowRight className="size-3" />}
              onPress={() => router.push("/admin/orders")}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
            >
              View all orders
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
