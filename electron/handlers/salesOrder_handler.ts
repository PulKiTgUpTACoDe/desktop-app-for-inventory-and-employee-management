import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { SalesOrderFormValues } from "../../src/types/salesOrder.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

// Generate order number
async function generateSalesOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const count = await prisma.salesOrder.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `SO${year}${month}${day}${sequence}`;
}

export function salesOrderHandlers() {
    ipcMain.handle("get-sales-orders", async () => {
        try {
            const salesOrders = await prisma.salesOrder.findMany({
                include: {
                    vendor: true,
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
            return { success: true, data: safeResult(salesOrders) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-sales-order-by-id", async (event, id: string) => {
        try {
            const salesOrder = await prisma.salesOrder.findUnique({
                where: { id },
                include: {
                    vendor: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(salesOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-sales-order", async (event, data: SalesOrderFormValues) => {
        try {
            console.log("Creating sales order with data:", data);

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
            const orderNumber = await generateSalesOrderNumber();
            console.log("Generated sales order number:", orderNumber);

            // Calculate total amount
            const totalAmount = data.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice);
            }, 0);
            console.log("Calculated total amount:", totalAmount);

            // Create sales order with items
            const newSalesOrder = await prisma.salesOrder.create({
                data: {
                    orderNumber,
                    vendorId: data.vendorId,
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
                    vendor: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                },
            });
            console.log("Sales order created successfully:", newSalesOrder.id);
            return { success: true, data: safeResult(newSalesOrder) };
        } catch (error) {
            console.error("Error creating sales order:", error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-sales-order", async (event, id: string, data: Partial<SalesOrderFormValues>) => {
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

            const updatedSalesOrder = await prisma.salesOrder.update({
                where: { id },
                data: updateData,
                include: {
                    vendor: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedSalesOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-sales-order", async (event, id: string) => {
        try {
            await prisma.salesOrder.delete({ where: { id } });
            return { success: true, message: "Sales order deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('salesOrder', String(error));
        }
    });

    ipcMain.handle("update-sales-order-status", async (event, id: string, status: string) => {
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

            const updatedSalesOrder = await prisma.salesOrder.update({
                where: { id },
                data: {
                    status,
                    processedBy: status !== "pending" ? adminUser.id : null,
                },
                include: {
                    vendor: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    creator: true,
                    processor: true,
                },
            });
            return { success: true, data: safeResult(updatedSalesOrder) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });
}
