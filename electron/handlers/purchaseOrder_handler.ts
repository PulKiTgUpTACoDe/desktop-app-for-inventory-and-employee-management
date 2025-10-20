import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { PurchaseOrderFormValues } from "../../src/types/purchaseOrder.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

// Generate order number
async function generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const count = await prisma.purchaseOrder.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `PO${year}${month}${day}${sequence}`;
}

export function purchaseOrderHandlers() {
    ipcMain.handle("get-purchase-orders", async () => {
        try {
            const purchaseOrders = await prisma.purchaseOrder.findMany({
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { success: true, data: safeResult(purchaseOrders) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-purchase-order-by-id", async (event, id: string) => {
        try {
            const purchaseOrder = await prisma.purchaseOrder.findUnique({
                where: { id },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(purchaseOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-purchase-order", async (event, data: PurchaseOrderFormValues) => {
        try {
            console.log("Creating purchase order with data:", data);

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

            // Generate order number if not provided
            const orderNumber = await generateOrderNumber();
            console.log("Generated order number:", orderNumber);

            // Calculate total amount
            const totalAmount = data.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice);
            }, 0);
            console.log("Calculated total amount:", totalAmount);

            // Create purchase order with items
            const newPurchaseOrder = await prisma.purchaseOrder.create({
                data: {
                    orderNumber,
                    supplierId: data.supplierId,
                    orderDate: new Date(data.orderDate),
                    expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
                    notes: data.notes,
                    totalAmount,
                    status: "pending",
                    createdBy: adminUser.id,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                        })),
                    },
                },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                },
            });
            console.log("Purchase order created successfully:", newPurchaseOrder.id);
            return { success: true, data: safeResult(newPurchaseOrder) };
        } catch (error) {
            console.error("Error creating purchase order:", error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-purchase-order", async (event, id: string, data: Partial<PurchaseOrderFormValues>) => {
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

            // Recalculate total amount if items are provided
            if (data.items) {
                updateData.totalAmount = data.items.reduce((sum, item) => {
                    return sum + (item.quantity * item.unitPrice);
                }, 0);
            }

            // Handle date fields
            if (data.orderDate) updateData.orderDate = new Date(data.orderDate);
            if (data.expectedDelivery) updateData.expectedDelivery = new Date(data.expectedDelivery);

            const updatedPurchaseOrder = await prisma.purchaseOrder.update({
                where: { id },
                data: updateData,
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedPurchaseOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-purchase-order", async (event, id: string) => {
        try {
            await prisma.purchaseOrder.delete({ where: { id } });
            return { success: true, message: "Purchase order deleted successfully." };
        } catch (error) {
            return formatPrismaDeleteError('purchaseOrder', String(error));
        }
    });

    ipcMain.handle("update-purchase-order-status", async (event, id: string, status: string) => {
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

            const updatedPurchaseOrder = await prisma.purchaseOrder.update({
                where: { id },
                data: {
                    status,
                    processedBy: status !== "pending" ? adminUser.id : null,
                },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedPurchaseOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });
}
