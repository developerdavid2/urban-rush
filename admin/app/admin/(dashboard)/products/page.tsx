"use client";

import { productApi } from "@/app/actions/productApi";
import { ProductForm } from "@/modules/products/ui/components/product-form";
import type { Product } from "@/types/product";
import { Button, Modal, useDisclosure } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, PencilIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProductsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return productApi.getAllProducts();
    },
  });

  const prd1 = products?.data?.[0]; // first product for edit demo

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(undefined);
    onOpen();
  };

  const openEditModal = () => {
    if (!prd1) return;
    setModalMode("edit");
    setSelectedProduct(prd1);
    onOpen();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your entire product inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            startContent={<PlusIcon className="size-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            onPress={openCreateModal}
            isDisabled={isLoading}
          >
            Add New Product
          </Button>

          <Button
            startContent={
              isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PencilIcon className="size-4" />
              )
            }
            variant="bordered"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 px-5 py-2.5 rounded-lg font-medium transition-all"
            onPress={openEditModal}
            isDisabled={isLoading || !prd1}
          >
            Edit First Product
          </Button>
        </div>
      </header>

      {/* Loading / Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <Loader2 className="size-10 animate-spin mb-4" />
          <p>Loading products...</p>
        </div>
      ) : !products?.data?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary border border-dashed border-admin-divider rounded-xl">
          <p className="text-lg font-medium mb-2">No products yet</p>
          <p className="text-sm">
            Click &quot;Add New Product&quot; to get started
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-admin-divider rounded-xl p-6">
          <p className="text-sm text-text-secondary">
            Showing {products.data.length} product(s) — demo focused on first
            item
          </p>
          {/* Here you would normally render a table/list of products */}
          <div className="mt-4 p-4 bg-zinc-950/50 rounded-lg border border-admin-divider/50">
            <p className="font-medium">First product (for edit demo):</p>
            <pre className="text-xs mt-2 text-emerald-300/90 overflow-auto">
              {JSON.stringify(prd1, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal - shared for create & edit */}
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
