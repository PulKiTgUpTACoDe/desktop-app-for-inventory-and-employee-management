import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().optional(), // Generated on backend
  salesOrderId: z.string().min(1, "Sales Order is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalAmount: z.number().min(0, "Total must be >= 0"),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
