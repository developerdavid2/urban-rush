"use client";

import { orderApi } from "@/app/actions/orderApi";
import {
  formatDate,
  getOrderStatusConfig,
  getPaymentStatusConfig,
} from "@/lib/dashboard-utils";
import { Column, TableView } from "@/modules/components/table-view";
import { Order } from "@/types/order";
import { Avatar, AvatarGroup, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import React, { useCallback, useState } from "react";

const columns: Column[] = [
  { name: "ORDER ID", uid: "_id", sortable: true },
  { name: "CUSTOMER", uid: "customer", sortable: false },
  { name: "PRODUCTS", uid: "items", sortable: false },
  { name: "TOTAL", uid: "totalAmount", sortable: true },
  { name: "PAYMENT", uid: "paymentStatus", sortable: true },
  { name: "STATUS", uid: "orderStatus", sortable: true },
  { name: "DATE", uid: "createdAt", sortable: true },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAllOrders,
  });

  const orders = ordersResponse?.data || [];

  React.useEffect(() => {
    console.log("=== DEBUG ===");
    console.log("Total orders:", orders.length);
    console.log(
      "Order IDs:",
      orders.map((o) => o._id)
    );

    // Check for duplicates
    const ids = orders.map((o) => String(o._id));
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.error("⚠️ DUPLICATE IDs FOUND!");
    }
  }, [orders]);
  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const renderCell = useCallback((order: Order, columnKey: React.Key) => {
    const key = columnKey as keyof Order;

    switch (columnKey) {
      case "_id": {
        const id = String(order._id).slice(0, 8).toUpperCase();
        return (
          <div className="flex flex-col">
            <p className="font-mono text-sm font-semibold text-gray-200">
              #{id}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase">
              {order.paymentIntentId
                ? `PI: ${String(order.paymentIntentId).slice(3, 10)}`
                : "No PI"}
            </p>
          </div>
        );
      }

      case "customer": {
        // Access user data from populated userId field
        const userName = order.userId?.name || "Unknown Customer";
        const userEmail = order.userId?.email || "";
        const address = order.shippingAddress;

        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            <p className="font-medium text-sm text-gray-200 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            {address && (
              <p className="text-xs text-gray-500 truncate">
                {address.city}, {address.state}
              </p>
            )}
          </div>
        );
      }

      case "items": {
        const items = order.items || [];
        const itemCount = items.length;

        // Get first 3 product images
        const productImages = items.slice(0, 3).map((item) => item.image);

        return (
          <div className="flex items-center gap-3">
            {/* Product Images */}
            {productImages.length > 0 ? (
              <AvatarGroup
                isBordered
                max={3}
                size="sm"
                className="justify-start"
              >
                {productImages.map((img, idx) => (
                  <Avatar
                    key={idx}
                    src={img || ""}
                    showFallback
                    fallback={<Package className="w-4 h-4 text-gray-400" />}
                    className="bg-gray-800"
                  />
                ))}
              </AvatarGroup>
            ) : (
              <Avatar
                showFallback
                fallback={<Package className="w-4 h-4 text-gray-400" />}
                size="sm"
                className="bg-gray-800"
              />
            )}

            {/* Item Details */}
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-200">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
              {items[0] && (
                <p className="text-xs text-gray-400 truncate max-w-[150px]">
                  {items[0].name}
                  {itemCount > 1 && ` +${itemCount - 1} more`}
                </p>
              )}
            </div>
          </div>
        );
      }

      case "totalAmount": {
        const amount = Number(order.totalAmount || 0);
        return (
          <p className="font-semibold text-sm text-gray-200">
            ${amount.toFixed(2)}
          </p>
        );
      }

      case "paymentStatus": {
        const status = order.paymentStatus || "pending";
        const config = getPaymentStatusConfig(status);
        return (
          <Chip
            classNames={{
              base: `capitalize border ${config.borderClass} ${config.bgClass}`,
              content: `${config.textClass} font-medium`,
            }}
            size="sm"
            variant="flat"
          >
            {config.label}
          </Chip>
        );
      }

      case "orderStatus": {
        const status = order.orderStatus || "pending";
        const config = getOrderStatusConfig(status);
        return (
          <Chip
            classNames={{
              base: `capitalize border ${config.borderClass} ${config.bgClass}`,
              content: `${config.textClass} font-medium`,
            }}
            size="sm"
            variant="flat"
          >
            {config.label}
          </Chip>
        );
      }

      case "createdAt": {
        const date = formatDate(String(order.createdAt));
        return (
          <div className="flex flex-col">
            <p className="text-sm text-gray-300">{date}</p>
            {order.deliveredAt && (
              <p className="text-xs text-green-500 mt-0.5">✓ Delivered</p>
            )}
            {order.shippedAt && !order.deliveredAt && (
              <p className="text-xs text-purple-500 mt-0.5">📦 Shipped</p>
            )}
          </div>
        );
      }

      default:
        const cellValue = order[key];
        return typeof cellValue === "object"
          ? JSON.stringify(cellValue)
          : String(cellValue);
    }
  }, []);

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const pendingOrders = orders.filter(
      (o) => o.paymentStatus === "pending"
    ).length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;

    return { totalRevenue, pendingOrders, paidOrders };
  }, [orders]);

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Orders ({orders?.length || 0})
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage customer orders and payments
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-admin-card border border-admin-divider rounded-lg p-4 hover:border-green-500/30 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-500">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From {stats.paidOrders} paid orders
            </p>
          </div>
          <div className="bg-admin-card border border-admin-divider rounded-lg p-4 hover:border-blue-500/30 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Paid Orders</p>
            <p className="text-2xl font-bold text-blue-500">
              {stats.paidOrders}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.paidOrders / orders.length) * 100 || 0).toFixed(1)}% of
              total
            </p>
          </div>
          <div className="bg-admin-card border border-admin-divider rounded-lg p-4 hover:border-yellow-500/30 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-500">
              {stats.pendingOrders}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting payment confirmation
            </p>
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <Loader2 className="size-10 animate-spin mb-4" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary border border-dashed border-admin-divider rounded-xl">
            <Package className="w-12 h-12 mb-4 text-gray-600" />
            <p className="text-lg font-medium mb-2">No orders yet</p>
            <p className="text-sm">
              When customers place orders, they will appear here.
            </p>
          </div>
        ) : (
          <TableView<Order>
            items={orders}
            columns={columns}
            renderCell={renderCell}
            getItemKey={(order) => String(order._id)}
            isLoading={isLoading}
            emptyMessage="No orders found"
            searchPlaceholder="Search by order ID, payment Intent ID,  customer, name, email, or status..."
            searchKeys={[
              "_id",
              "paymentStatus",
              "userId.name",
              "userId.email",
              "orderStatus",
              "paymentIntentId",
            ]}
          />
        )}
      </div>
    </>
  );
}
