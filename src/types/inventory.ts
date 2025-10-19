import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    price: z.number().min(0, "Price must be >= 0"),
    costPrice: z.number().min(0, "Cost Price must be >= 0"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    brandId: z.string().min(1, "Brand is required"),
});

export const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
});

export const brandSchema = z.object({
    name: z.string().min(1, "Brand name is required"),
    description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type BrandFormValues = z.infer<typeof brandSchema>;