import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { InvoiceFormValues } from "../../src/types/invoice.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

// Generate invoice number
async function generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const count = await prisma.invoice.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `INV${year}${month}${day}${sequence}`;
}

export function invoiceHandlers() {
    ipcMain.handle("get-invoices", async () => {
        try {
            const invoices = await prisma.invoice.findMany({
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { success: true, data: safeResult(invoices) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-invoice-by-id", async (event, id: string) => {
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
            });
            return { success: true, data: safeResult(invoice) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-invoice", async (event, data: InvoiceFormValues) => {
        try {
            console.log("Creating invoice with data:", data);
            
            // Check if sales order exists and get its details
            const salesOrder = await prisma.salesOrder.findUnique({
                where: { id: data.salesOrderId },
                include: {
                    items: true,
                },
            });

            if (!salesOrder) {
                return { success: false, error: "Sales order not found" };
            }

            // Check if invoice already exists for this sales order
            const existingInvoice = await prisma.invoice.findFirst({
                where: { salesOrderId: data.salesOrderId },
            });

            if (existingInvoice) {
                return { 
                    success: false, 
                    error: "Invoice already exists for this sales order" 
                };
            }

            // Generate invoice number
            const invoiceNumber = await generateInvoiceNumber();
            console.log("Generated invoice number:", invoiceNumber);

            // Use the sales order's total amount
            const totalAmount = Number(salesOrder.totalAmount);
            console.log("Using sales order total amount:", totalAmount);

            // Create invoice
            const newInvoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    salesOrderId: data.salesOrderId,
                    invoiceDate: new Date(data.invoiceDate),
                    dueDate: new Date(data.dueDate),
                    totalAmount,
                    status: data.status,
                },
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
            });
            console.log("Invoice created successfully:", newInvoice.id);
            return { success: true, data: safeResult(newInvoice) };
        } catch (error) {
            console.error("Error creating invoice:", error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-invoice", async (event, id: string, data: Partial<InvoiceFormValues>) => {
        try {
            let updateData: any = {
                ...data,
                updatedAt: new Date(),
            };

            // Handle date fields
            if (data.invoiceDate) updateData.invoiceDate = new Date(data.invoiceDate);
            if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

            const updatedInvoice = await prisma.invoice.update({
                where: { id },
                data: updateData,
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
            });
            return { success: true, data: safeResult(updatedInvoice) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-invoice", async (event, id: string) => {
        try {
            await prisma.invoice.delete({ where: { id } });
            return { success: true, message: "Invoice deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('invoice', error);
        }
    });

    ipcMain.handle("update-invoice-status", async (event, id: string, status: string) => {
        try {
            const updatedInvoice = await prisma.invoice.update({
                where: { id },
                data: { status },
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
            });
            return { success: true, data: safeResult(updatedInvoice) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });
}
