import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { ProductFormValues, CategoryFormValues, BrandFormValues } from "../../src/types/inventory.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

export function inventoryHandlers() {
    ipcMain.handle("get-products", async () => {
        try {
            const products = await prisma.product.findMany({
                include: {
                    category: true,
                    brand: true,
                },
            });
            return { success: true, data: safeResult(products) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-product-by-id", async (event, id: string) => {
        try {
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    brand: true,
                },
            });
            return { success: true, data: safeResult(product) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-product", async (event, data: ProductFormValues) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const newProduct = await prisma.product.create({
                data: {
                    ...data,
                    price: Number(data.price),
                    costPrice: Number(data.costPrice),
                    createdBy: adminUser.id,
                    updatedBy: adminUser.id,
                },
                include: {
                    category: true,
                    brand: true,
                },
            });
            return { success: true, data: safeResult(newProduct) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-product", async (event, id: string, data: Partial<ProductFormValues>) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const updatedProduct = await prisma.product.update({
                where: { id },
                data: {
                    ...data,
                    ...(data.price && { price: Number(data.price) }),
                    ...(data.costPrice && { costPrice: Number(data.costPrice) }),
                    updatedBy: adminUser.id,
                },
                include: {
                    category: true,
                    brand: true,
                },
            });
            return { success: true, data: safeResult(updatedProduct) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-product", async (event, id: string) => {
        try {
            await prisma.product.delete({ where: { id } });
            return { success: true, message: "Product deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('product', error);
        }
    });

    // Category Handlers
    ipcMain.handle("get-categories", async () => {
        try {
            const categories = await prisma.productCategory.findMany();
            return { success: true, data: safeResult(categories) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-category", async (event, data: CategoryFormValues) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const newCategory = await prisma.productCategory.create({
                data: {
                    ...data,
                    createdBy: adminUser.id,
                    updatedBy: adminUser.id,
                },
            });
            return { success: true, data: safeResult(newCategory) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-category", async (event, id: string, data: Partial<CategoryFormValues>) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const updatedCategory = await prisma.productCategory.update({
                where: { id },
                data: {
                    ...data,
                    updatedBy: adminUser.id,
                },
            });
            return { success: true, data: safeResult(updatedCategory) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-category", async (event, id: string) => {
        try {
            await prisma.productCategory.delete({ where: { id } });
            return { success: true, message: "Category deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('productCategory', error);
        }
    });

    // Brand Handlers
    ipcMain.handle("get-brands", async () => {
        try {
            const brands = await prisma.productBrand.findMany();
            return { success: true, data: safeResult(brands) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-brand", async (event, data: BrandFormValues) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const newBrand = await prisma.productBrand.create({
                data: {
                    ...data,
                    createdBy: adminUser.id,
                    updatedBy: adminUser.id,
                },
            });
            return { success: true, data: safeResult(newBrand) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-brand", async (event, id: string, data: Partial<BrandFormValues>) => {
        try {
            const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
            if (!adminUser) return { success: false, error: "No admin user found" };

            const updatedBrand = await prisma.productBrand.update({
                where: { id },
                data: {
                    ...data,
                    updatedBy: adminUser.id,
                },
            });
            return { success: true, data: safeResult(updatedBrand) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-brand", async (event, id: string) => {
        try {
            await prisma.productBrand.delete({ where: { id } });
            return { success: true, message: "Brand deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('productBrand', error);
        }
    });
}
