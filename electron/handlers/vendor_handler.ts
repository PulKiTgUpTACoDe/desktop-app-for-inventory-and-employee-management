import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { VendorFormValues } from "../../src/types/vendor.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

export function vendorHandlers() {
    ipcMain.handle("get-vendors", async () => {
        try {
            const vendors = await prisma.vendor.findMany({
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(vendors) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-vendor-by-id", async (event, id: string) => {
        try {
            const vendor = await prisma.vendor.findUnique({
                where: { id },
                include: {
                    creator: true,
                    updater: true,
                },
            });
            return { success: true, data: safeResult(vendor) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-vendor", async (event, data: VendorFormValues) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const newVendor = await prisma.vendor.create({
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
            return { success: true, data: safeResult(newVendor) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-vendor", async (event, id: string, data: Partial<VendorFormValues>) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const updatedVendor = await prisma.vendor.update({
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
            return { success: true, data: safeResult(updatedVendor) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-vendor", async (event, id: string) => {
        try {
            await prisma.vendor.delete({ where: { id } });
            return { success: true, message: "Vendor deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('vendor', String(error));
        }
    });
}
