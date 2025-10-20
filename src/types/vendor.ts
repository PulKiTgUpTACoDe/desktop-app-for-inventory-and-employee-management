import { z } from "zod";

export const vendorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone is required"),
    address: z.string().optional().or(z.literal("")),
    contactPerson: z.string().min(1, "Contact person is required"),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
