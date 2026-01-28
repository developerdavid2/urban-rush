"use client";

import { Product } from "@/types/product";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/app/actions/productApi";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

interface DeleteProductProps {
  product?: Product;
  onClose: () => void;
  isOpen: boolean;
}

export function DeleteProductModal({
  product,
  onClose,
  isOpen,
}: DeleteProductProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return productApi.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete product. Please try again.");
    },
  });

  const isDeleting = deleteMutation.isPending;

  const handleDeleteProduct = async () => {
    if (!product?._id) return;
    await deleteMutation.mutateAsync({ id: product._id });
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          onClose();
        }
      }}
      isDismissable={!isDeleting}
      isKeyboardDismissDisabled={isDeleting}
      classNames={{
        backdrop: "bg-admin-bg/80 backdrop-blur-sm",
        base: "bg-[#111412] border border-admin-divider/30",
      }}
    >
      <ModalContent>
        {(modalOnClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Delete Product
            </ModalHeader>
            <ModalBody>
              <p className="text-medium font-medium">
                Are you sure you want to delete{" "}
                <span className="text-emerald-400 font-bold">
                  {product?.name || "this product"}
                </span>
                ?
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={modalOnClose}
                isDisabled={isDeleting}
                className="text-white"
              >
                Cancel
              </Button>

              <Button
                color="danger"
                onPress={handleDeleteProduct}
                isDisabled={isDeleting}
                isLoading={isDeleting}
                spinner={<Loader className="h-4 w-4 animate-spin" />}
                spinnerPlacement="start"
                className="bg-red-400/80 text-white min-w-25"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
