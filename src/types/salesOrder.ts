import { z } from "zod";

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
});

export const salesOrderSchema = z.object({
  orderNumber: z.string().optional(), // Generated on backend
  vendorId: z.string().min(1, "Vendor is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(salesOrderItemSchema).min(1, "Add at least one item"),
});

export type SalesOrderItemFormValues = z.infer<typeof salesOrderItemSchema>;
export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;
