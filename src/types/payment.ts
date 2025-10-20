import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be > 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["card", "upi", "net_banking", "cash", "cheque", "bank_transfer", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
