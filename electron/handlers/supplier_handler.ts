import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { SupplierFormValues } from "../../src/types/supplier.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

export function supplierHandlers() {
    ipcMain.handle("get-suppliers", async () => {
        try {
            const suppliers = await prisma.supplier.findMany({
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(suppliers) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-supplier-by-id", async (event, id: string) => {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(supplier) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-supplier", async (event, data: SupplierFormValues) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const newSupplier = await prisma.supplier.create({
                data: {
                    ...data,
                    createdBy: adminUser.id,
                    updatedBy: adminUser.id,
                },
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(newSupplier) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-supplier", async (event, id: string, data: Partial<SupplierFormValues>) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const updatedSupplier = await prisma.supplier.update({
                where: { id },
                data: {
                    ...data,
                    updatedBy: adminUser.id,
                },
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(updatedSupplier) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-supplier", async (event, id: string) => {
        try {
            await prisma.supplier.delete({ where: { id } });
            return { success: true, message: "Supplier deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('supplier', error);
        }
    });
}
