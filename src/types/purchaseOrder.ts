import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
});

export const purchaseOrderSchema = z.object({
  orderNumber: z.string().optional(), // Generated on backend
  supplierId: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(purchaseOrderItemSchema).min(1, "Add at least one item"),
});

export type PurchaseOrderItemFormValues = z.infer<typeof purchaseOrderItemSchema>;
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
