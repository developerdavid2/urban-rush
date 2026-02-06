"use client";

import { Order } from "@/types/order";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Select,
  SelectItem,
  Divider,
  Avatar,
} from "@heroui/react";
import {
  formatDate,
  getOrderStatusConfig,
  getPaymentStatusConfig,
} from "@/lib/dashboard-utils";
import { Package, MapPin, CreditCard, Clock } from "lucide-react";
import { useState } from "react";
import { orderApi } from "@/app/actions/orderApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const orderStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!order) return;
      return orderApi.updateOrderStatus(String(order._id), newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === order?.orderStatus) {
      toast.error("Please select a different status");
      return;
    }
    updateStatusMutation.mutate(selectedStatus);
  };

  if (!order) return null;
  const orderStatus = getOrderStatusConfig(order?.orderStatus);
  const paymentStatus = getPaymentStatusConfig(order?.paymentStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-admin-card border border-admin-divider",
        header: "border-b border-admin-divider",
        body: "py-6",
        footer: "border-t border-admin-divider",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-200">
                Order #{String(order._id).slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-400 font-normal mt-1">
                Placed on {formatDate(String(order.createdAt))}
              </p>
            </div>
            <div className="flex gap-2">
              <Chip
                classNames={{
                  base: `capitalize border ${paymentStatus?.borderClass} ${paymentStatus?.bgClass}`,
                  content: paymentStatus?.textClass,
                }}
                variant="flat"
              >
                {order.paymentStatus}
              </Chip>
              <Chip
                classNames={{
                  base: `capitalize border ${orderStatus?.borderClass} ${orderStatus?.bgClass}`,
                  content: orderStatus?.textClass,
                }}
                variant="flat"
              >
                {order.orderStatus}
              </Chip>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-gray-200 font-medium">
                    {order.userId?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-200">
                    {order.userId?.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer ID:</span>
                  <span className="text-gray-200 font-mono text-sm">
                    {order.clerkId.slice(0, 12)}...
                  </span>
                </div>
              </div>
            </div>

            <Divider className="bg-admin-divider" />

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-1">
                <p className="text-gray-200 font-medium">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-300">{order.shippingAddress.street}</p>
                <p className="text-gray-300">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-300">{order.shippingAddress.country}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Phone: {order.shippingAddress.phoneNumber}
                </p>
              </div>
            </div>

            <Divider className="bg-admin-divider" />

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3"
                  >
                    <Avatar
                      src={item.image}
                      showFallback
                      fallback={<Package className="w-5 h-5" />}
                      size="lg"
                      className="bg-gray-700"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-200">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-200">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="bg-admin-divider" />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>${(order.totalAmount * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (8%):</span>
                  <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <Divider className="bg-admin-divider" />
                <div className="flex justify-between text-lg font-bold text-gray-200">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                {order.paymentIntentId && (
                  <div className="mt-3 pt-3 border-t border-admin-divider">
                    <p className="text-xs text-gray-400">
                      Payment Intent: {order.paymentIntentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Divider className="bg-admin-divider" />

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-gray-200">
                    {formatDate(String(order.createdAt))}
                  </span>
                </div>
                {order.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipped:</span>
                    <span className="text-purple-400">
                      {formatDate(String(order.shippedAt))}
                    </span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivered:</span>
                    <span className="text-green-400">
                      {formatDate(String(order.deliveredAt))}
                    </span>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cancelled:</span>
                    <span className="text-red-400">
                      {formatDate(String(order.cancelledAt))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Divider className="bg-admin-divider" />

            {/* Update Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Update Order Status
              </h3>
              <div className="flex gap-3">
                <Select
                  label="Order Status"
                  placeholder="Select new status"
                  selectedKeys={selectedStatus ? [selectedStatus] : []}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  classNames={{
                    trigger: "bg-gray-800 border-admin-divider",
                    value: "text-gray-200",
                  }}
                >
                  {orderStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  color="primary"
                  onPress={handleStatusUpdate}
                  isLoading={updateStatusMutation.isPending}
                  isDisabled={
                    !selectedStatus || selectedStatus === order.orderStatus
                  }
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
