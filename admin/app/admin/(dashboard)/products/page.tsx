// app/products/page.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ProductForm } from "@/modules/products/ui/components/product-form";
import {
  getStockStatus,
  getStockStatusConfig,
  StockStatus,
} from "@/lib/dashboard-utils";
import { Button, Modal, useDisclosure, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/app/actions/productApi";
import { Loader2, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Product } from "@/types/product";
import { TableView, Column } from "@/modules/components/table-view";

const columns: Column[] = [
  { name: "IMAGE", uid: "images" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "CATEGORY", uid: "category", sortable: true },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STOCK", uid: "stock", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export default function ProductsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAllProducts,
  });

  const products = productsResponse?.data;

  const enhancedProducts = useMemo(() => {
    if (!products) return;
    return products.map((p: Product) => ({
      ...p,
      status: getStockStatus(p.stock),
    }));
  }, [products]);

  const renderCell = useCallback(
    (product: Product, columnKey: React.Key) => {
      const key = columnKey as keyof Product;
      const cellValue = product[key];

      switch (columnKey) {
        case "images":
          const firstImage = Array.isArray(cellValue) && cellValue[0];
          return firstImage ? (
            <div className="relative size-18 rounded-md overflow-hidden bg-zinc-800">
              <Image
                src={firstImage}
                alt={product.name || "Product"}
                fill
                className="object-cover"
                quality={90}
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500 text-xs">
              No Img
            </div>
          );

        case "name":
          return <p className="font-medium text-small">{String(cellValue)}</p>;

        case "category":
          return <p className="text-small capitalize">{String(cellValue)}</p>;

        case "price":
          return (
            <p className="text-small font-medium">
              ${Number(cellValue).toFixed(2)}
            </p>
          );

        case "stock":
          return <p className="text-small">{String(cellValue)}</p>;

        case "status":
          const config = getStockStatusConfig(cellValue as StockStatus);
          return (
            <Chip
              classNames={{
                base: `capitalize border ${config.borderClass} ${config.bgClass}`,
                content: config.textClass,
              }}
              size="sm"
              variant="flat"
            >
              {config.label}
            </Chip>
          );

        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  setModalMode("edit");
                  setSelectedProduct(product);
                  onOpen();
                }}
              >
                <PencilIcon className="size-4 text-emerald-100" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  if (confirm("Delete this product?")) {
                    toast.success("Product deleted (placeholder)");
                  }
                }}
              >
                <Trash2Icon className="size-4 text-red-400/70" />
              </Button>
            </div>
          );

        default:
          return typeof cellValue === "object"
            ? JSON.stringify(cellValue)
            : String(cellValue);
      }
    },
    [onOpen]
  );

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(undefined);
    onOpen();
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your entire product inventory
          </p>
        </div>

        <Button
          startContent={<PlusIcon className="size-4" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
          onPress={openCreateModal}
          isDisabled={isLoading}
        >
          Add New Product
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <Loader2 className="size-10 animate-spin mb-4" />
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary border border-dashed border-admin-divider rounded-xl">
          <p className="text-lg font-medium mb-2">No products yet</p>
          <p className="text-sm">
            Click &ldquo;Add New Product&rdquo; to get started
          </p>
        </div>
      ) : (
        <TableView<Product>
          items={enhancedProducts}
          columns={columns}
          renderCell={renderCell}
          getItemKey={(product) => product._id}
          isLoading={isLoading}
          emptyMessage="No products found"
          searchPlaceholder="Search by name or category..."
          searchKeys={["name", "category"]} // Search through these fields
        />
      )}

      <Modal
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-admin-bg/50 backdrop-blur-sm",
          base: "bg-[#111412] border border-admin-divider/30",
          header: "border-b border-admin-divider",
          footer: "border-t border-admin-divider",
        }}
      >
        <ProductForm
          onClose={() => onOpenChange()}
          product={modalMode === "edit" ? selectedProduct : undefined}
        />
      </Modal>
    </div>
  );
}
