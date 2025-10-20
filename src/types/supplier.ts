import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    contactPerson: z.string().optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
