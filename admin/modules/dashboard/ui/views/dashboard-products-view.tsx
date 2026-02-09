"use client";

import { cn } from "@/lib/utils";
import { TopProductsData } from "@/types/dashboard";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/react";
import { ArrowRight, Package, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DashboardProductsViewProps {
  data?: TopProductsData;
  isLoading?: boolean;
}

export default function DashboardProductsView({
  data,
  isLoading = false,
}: DashboardProductsViewProps) {
  const router = useRouter();

  const products = data?.products.slice(0, 5) || [];

  return (
    <Card className="relative h-full bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-40 sm:size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] sm:blur-[140px] opacity-25 pointer-events-none" />

      <CardBody className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800/50">
              <Package className="size-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Top Selling Products
            </h3>
          </div>
          <Button
            size="sm"
            variant="light"
            endContent={<ArrowRight className="size-4" />}
            onPress={() => router.push("/admin/products")}
            className="text-zinc-400 hover:text-white"
          >
            See all
          </Button>
        </div>

        {/* Products List */}
        <div className="flex-1  space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
              >
                <div className="size-12 rounded bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-zinc-800" />
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                </div>
                <div className="h-5 w-16 rounded bg-zinc-800" />
              </div>
            ))
          ) : products.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Package className="size-12 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-500">
                No products data available
              </p>
            </div>
          ) : (
            // Product items
            products.map((product, index) => (
              <div
                key={product.productId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "bg-zinc-800/30 hover:bg-zinc-800/50",
                  "border border-zinc-700/30 hover:border-zinc-600/50",
                  "transition-all duration-200 cursor-pointer relative"
                )}
              >
                {/* Product Image */}
                <div className="relative size-12 rounded-md overflow-hidden bg-zinc-800">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="size-6 text-zinc-500" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-400">
                      {product.totalQuantitySold} sold
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400 capitalize">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Revenue */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-emerald-500">
                    ${product.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="size-3 text-emerald-400" />
                    <span className="text-xs text-zinc-500">
                      {product.numberOfOrders} order
                      {product.numberOfOrders > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Rank Badge */}
                <div className="absolute top-2 left-2 size-4 rounded-full bg-zinc-500/60 backdrop-blur-3xl text-white text-[10px] font-semibold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && data && products.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50">
            <div className="grid grid-cols-2 justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
                <p className="text-lg font-bold text-white">
                  ${data.totals.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Sold</p>
                <p className="text-lg font-bold text-white">
                  {data.totals.totalQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
