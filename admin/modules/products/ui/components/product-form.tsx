"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { toast } from "react-hot-toast";
import {
  productSchema,
  ProductFormData,
} from "@/lib/validations/product.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/app/actions/productApi";
import { ImageUpload } from "./image-upload";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "home", label: "Home & Garden" },
];

export function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!product;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price?.toString() || "",
      priceDiscount: product?.priceDiscount?.toString() || "",
      stock: product?.stock?.toString() || "",
      summary: product?.summary || "",
      description: product?.description || "",
      images: [],
      existingImages: product?.images || [],
      removedImages: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return productApi.createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        isEditMode
          ? "Product updated successfully"
          : "Product created successfully"
      );
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Failed to create product. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      return productApi.updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update product. Please try again.");
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("price", data.price);
    formData.append("stock", data.stock);
    formData.append("summary", data.summary);
    formData.append("description", data.description);

    if (data.priceDiscount) {
      formData.append("priceDiscount", data.priceDiscount);
    }

    // Add new images
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    // Add removed images for edit mode
    if (isEditMode && data.removedImages && data.removedImages.length > 0) {
      data.removedImages.forEach((url) => {
        formData.append("removedImages", url);
      });
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: product!._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch {}
  };

  return (
    <ModalContent>
      {(modalOnClose) => (
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </ModalHeader>

          <ModalBody className="max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Product Name"
                    placeholder="Enter product name"
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    isDisabled={isSubmitting}
                    variant="bordered"
                    classNames={{
                      inputWrapper: cn(
                        "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                        "hover:border-zinc-500",
                        "data-[focus=true]:!border-emerald-600",
                        "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                        "transition-all duration-200",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                      ),
                      label:
                        "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                      input: "text-white",
                    }}
                  />
                )}
              />

              {/* Category */}
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Category"
                    placeholder="Select category"
                    variant="bordered"
                    isInvalid={!!errors.category}
                    errorMessage={errors.category?.message}
                    isDisabled={isSubmitting}
                    classNames={{
                      label:
                        "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                      value: cn(
                        "text-zinc-400",
                        "group-data-[has-value=true]:text-white",
                        "group-data-[has-value=false]:opacity-70 group-data-[has-value=false]:italic"
                      ),
                      trigger: cn(
                        "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                        "hover:border-zinc-500",
                        "data-[focus=true]:!border-emerald-600",
                        "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                        "data-[open=true]:border-emerald-600/70",
                        "transition-all duration-200"
                      ),
                      popoverContent:
                        "bg-[#1b211e] border border-admin-divider/60 shadow-xl backdrop-blur-sm rounded-lg p-1",
                      listboxWrapper: "bg-transparent p-0",
                      listbox: "bg-transparent p-1 gap-0.5",
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        classNames={{
                          base: cn(
                            "text-white transition-colors",
                            "data-[hover=true]:bg-emerald-900/30",
                            "data-[selected=true]:bg-emerald-900/50",
                            "data-[selected=true]:text-emerald-400",
                            "[&[data-selected=true][data-hover=true]]:bg-emerald-900/50",
                            "[&[data-selected=true][data-hover=true]]:text-emerald-400",
                            "data-[focus=true]:bg-emerald-950/40"
                          ),
                        }}
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              {/* Price */}
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Price ($)"
                    placeholder="39.99"
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                    isDisabled={isSubmitting}
                    variant="bordered"
                    classNames={{
                      inputWrapper: cn(
                        "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                        "hover:border-zinc-500",
                        "data-[focus=true]:!border-emerald-600",
                        "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                        "transition-all duration-200",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                      ),
                      label:
                        "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                      input: "text-white",
                    }}
                  />
                )}
              />

              {/* Stock */}
              <Controller
                name="stock"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Stock"
                    placeholder="54"
                    isInvalid={!!errors.stock}
                    errorMessage={errors.stock?.message}
                    isDisabled={isSubmitting}
                    variant="bordered"
                    classNames={{
                      inputWrapper: cn(
                        "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                        "hover:border-zinc-500",
                        "data-[focus=true]:!border-emerald-600",
                        "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                        "transition-all duration-200",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                      ),
                      label:
                        "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                      input: "text-white",
                    }}
                  />
                )}
              />

              {/* Summary */}
              <div className="col-span-2">
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Summary"
                      placeholder="Brief product summary..."
                      minRows={2}
                      isInvalid={!!errors.summary}
                      errorMessage={errors.summary?.message}
                      isDisabled={isSubmitting}
                      variant="bordered"
                      classNames={{
                        inputWrapper: cn(
                          "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                          "hover:border-zinc-500",
                          "data-[focus=true]:!border-emerald-600",
                          "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                          "transition-all duration-200",
                          isSubmitting && "opacity-70 cursor-not-allowed"
                        ),
                        label:
                          "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                        input: "text-white",
                      }}
                    />
                  )}
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description"
                      placeholder="Detailed product description..."
                      minRows={4}
                      isInvalid={!!errors.description}
                      errorMessage={errors.description?.message}
                      isDisabled={isSubmitting}
                      variant="bordered"
                      classNames={{
                        inputWrapper: cn(
                          "border-2 border-zinc-700 rounded-lg bg-zinc-900/40",
                          "hover:border-zinc-500",
                          "data-[focus=true]:!border-emerald-600",
                          "data-[focus=true]:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
                          "transition-all duration-200",
                          isSubmitting && "opacity-70 cursor-not-allowed"
                        ),
                        label:
                          "group-data-[focus=true]:text-emerald-400 group-data-[filled=true]:text-background",
                        input: "text-white",
                      }}
                    />
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="col-span-2">
                <Controller
                  name="images"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      existingImages={watch("existingImages") || []}
                      onRemoveExisting={(url) => {
                        const current = watch("removedImages") || [];
                        setValue("removedImages", [...current, url]);

                        const existing = watch("existingImages") || [];
                        setValue(
                          "existingImages",
                          existing.filter((img) => img !== url)
                        );
                      }}
                      error={errors.images?.message}
                      disabled={isSubmitting}
                      isEdit={isEditMode}
                    />
                  )}
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                modalOnClose();
                onClose();
              }}
              isDisabled={isSubmitting}
              className="bg-zinc-300 text-admin-bg"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-35"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              spinnerPlacement="start"
              spinner={<Loader className="h-4 w-4 animate-spin" />}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Product"
                : "Create Product"}
            </Button>
          </ModalFooter>
        </form>
      )}
    </ModalContent>
  );
}
