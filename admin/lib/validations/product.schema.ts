import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    price: z.string().min(1, "Price is required"),
    priceDiscount: z.string().optional(),
    stock: z.string().min(1, "Stock is required"),
    summary: z.string().min(1, "Summary is required"),
    description: z.string().min(1, "Description is required"),
    images: z.array(z.instanceof(File)).optional(),
    existingImages: z.array(z.string()).optional(),
    removedImages: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // At least one image must exist (either new or existing)
      const hasNewImages = data.images && data.images.length > 0;
      const existingCount =
        (data.existingImages?.length || 0) - (data.removedImages?.length || 0);
      return hasNewImages || existingCount > 0;
    },
    {
      message: "At least one product image is required",
      path: ["images"],
    }
  );

export type ProductFormData = z.infer<typeof productSchema>;
