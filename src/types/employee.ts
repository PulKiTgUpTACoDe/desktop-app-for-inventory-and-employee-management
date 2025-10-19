import { z } from "zod"

export const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
    hireDate: z.string().min(1, "Hire date is required"),
    salary: z.number().min(0, "Salary must be >= 0"),
  });
  
export type EmployeeFormValues = z.infer<typeof employeeSchema>;