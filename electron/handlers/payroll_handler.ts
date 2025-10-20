import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { PayrollFormValues } from "../../src/types/payroll.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

export function payrollHandlers() {
    ipcMain.handle("get-payrolls", async () => {
        try {
            const payrolls = await prisma.payroll.findMany({
                include: {
                    employee: true,
                    creator: true,
                    processor: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { success: true, data: safeResult(payrolls) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-payroll-by-id", async (event, id: string) => {
        try {
            const payroll = await prisma.payroll.findUnique({
                where: { id },
                include: {
                    employee: true,
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(payroll) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-payroll", async (event, data: PayrollFormValues) => {
        try {
            console.log("Creating payroll with data:", data);

            // First, try to find an admin user
            let adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });

            // If no admin user found, create a default one
            if (!adminUser) {
                console.log("No admin user found, creating default admin user");
                adminUser = await prisma.adminUser.create({
                    data: {
                        username: 'admin',
                        password: 'admin123',
                        email: 'admin@swarajdryfruits.com',
                        fullName: 'System Administrator',
                        role: 'admin',
                        isActive: true
                    }
                });
            }

            // Calculate net salary
            const netSalary = Math.max(0, data.basicSalary + data.allowances - data.deductions);
            console.log("Calculated net salary:", netSalary);

            // Check if payroll already exists for this employee, month, and year
            const existingPayroll = await prisma.payroll.findFirst({
                where: {
                    employeeId: data.employeeId,
                    month: data.month,
                    year: data.year,
                },
            });

            if (existingPayroll) {
                return {
                    success: false,
                    error: `Payroll already exists for this employee for ${data.month}/${data.year}`
                };
            }

            // Create payroll
            const newPayroll = await prisma.payroll.create({
                data: {
                    employeeId: data.employeeId,
                    month: data.month,
                    year: data.year,
                    basicSalary: data.basicSalary,
                    allowances: data.allowances,
                    deductions: data.deductions,
                    netSalary: netSalary,
                    status: data.status,
                    createdBy: adminUser.id,
                },
                include: {
                    employee: true,
                    creator: true,
                },
            });
            console.log("Payroll created successfully:", newPayroll.id);
            return { success: true, data: safeResult(newPayroll) };
        } catch (error) {
            console.error("Error creating payroll:", error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-payroll", async (event, id: string, data: Partial<PayrollFormValues>) => {
        try {
            let adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) {
                adminUser = await prisma.adminUser.create({
                    data: {
                        username: 'admin',
                        password: 'admin123',
                        email: 'admin@swarajdryfruits.com',
                        fullName: 'System Administrator',
                        role: 'admin',
                        isActive: true
                    }
                });
            }

            let updateData: any = {
                ...data,
                updatedAt: new Date(),
            };

            // Recalculate net salary if salary components are provided
            if (data.basicSalary !== undefined || data.allowances !== undefined || data.deductions !== undefined) {
                const currentPayroll = await prisma.payroll.findUnique({ where: { id } });
                if (currentPayroll) {
                    const basicSalary = data.basicSalary !== undefined ? Number(data.basicSalary) : Number(currentPayroll.basicSalary);
                    const allowances = data.allowances !== undefined ? Number(data.allowances) : Number(currentPayroll.allowances);
                    const deductions = data.deductions !== undefined ? Number(data.deductions) : Number(currentPayroll.deductions);
                    updateData.netSalary = Math.max(0, basicSalary + allowances - deductions);
                }
            }

            const updatedPayroll = await prisma.payroll.update({
                where: { id },
                data: updateData,
                include: {
                    employee: true,
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedPayroll) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-payroll", async (event, id: string) => {
        try {
            await prisma.payroll.delete({ where: { id } });
            return { success: true, message: "Payroll deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('payroll', error);
        }
    });

    ipcMain.handle("update-payroll-status", async (event, id: string, status: string) => {
        try {
            let adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) {
                adminUser = await prisma.adminUser.create({
                    data: {
                        username: 'admin',
                        password: 'admin123',
                        email: 'admin@swarajdryfruits.com',
                        fullName: 'System Administrator',
                        role: 'admin',
                        isActive: true
                    }
                });
            }

            const updatedPayroll = await prisma.payroll.update({
                where: { id },
                data: {
                    status,
                    processedBy: status !== "pending" ? adminUser.id : null,
                },
                include: {
                    employee: true,
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedPayroll) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });
}
