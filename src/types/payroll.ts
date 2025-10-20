import { z } from "zod";

export const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.number().min(1, "Month must be between 1-12").max(12, "Month must be between 1-12"),
  year: z.number().min(1900, "Year must be valid").max(2100, "Year must be valid"),
  basicSalary: z.number().min(0, "Basic salary must be >= 0"),
  allowances: z.number().min(0, "Allowances must be >= 0"),
  deductions: z.number().min(0, "Deductions must be >= 0"),
  status: z.enum(["pending", "processed", "paid"]),
});

export type PayrollFormValues = z.infer<typeof payrollSchema>;
