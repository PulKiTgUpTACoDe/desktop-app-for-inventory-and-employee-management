import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { formatPrismaDeleteError } from "../utils/errorHandling.js";
import { PaymentFormValues } from "../../src/types/payment.js";

function safeResult<T>(data: T) {
    return JSON.parse(JSON.stringify(data));
}

export function paymentHandlers() {
    ipcMain.handle("get-payments", async () => {
        try {
            const payments = await prisma.payment.findMany({
                include: {
                    invoice: {
                        include: {
                            salesOrder: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { success: true, data: safeResult(payments) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("get-payment-by-id", async (event, id: string) => {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id },
                include: {
                    invoice: {
                        include: {
                            salesOrder: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                },
            });
            return { success: true, data: safeResult(payment) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("create-payment", async (event, data: PaymentFormValues) => {
        try {
            console.log("Creating payment with data:", data);
            
            // Check if invoice exists and get its details
            const invoice = await prisma.invoice.findUnique({
                where: { id: data.invoiceId },
                include: {
                    salesOrder: {
                        include: {
                            vendor: true,
                        },
                    },
                },
            });

            if (!invoice) {
                return { success: false, error: "Invoice not found" };
            }

            // Check if payment amount exceeds invoice total
            const existingPayments = await prisma.payment.findMany({
                where: { invoiceId: data.invoiceId },
            });

            const totalPaid = existingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const remainingAmount = Number(invoice.totalAmount) - totalPaid;

            if (data.amount > remainingAmount) {
                return { 
                    success: false, 
                    error: `Payment amount ($${data.amount.toFixed(2)}) exceeds remaining amount ($${remainingAmount.toFixed(2)})` 
                };
            }

            // Create payment
            const newPayment = await prisma.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    amount: data.amount,
                    paymentDate: new Date(data.paymentDate),
                    paymentMethod: data.paymentMethod,
                    reference: data.reference || null,
                    notes: data.notes || null,
                },
                include: {
                    invoice: {
                        include: {
                            salesOrder: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                },
            });

            // Update invoice status if fully paid
            const newTotalPaid = totalPaid + data.amount;
            if (newTotalPaid >= Number(invoice.totalAmount)) {
                await prisma.invoice.update({
                    where: { id: data.invoiceId },
                    data: { status: "paid" },
                });
            }

            console.log("Payment created successfully:", newPayment.id);
            return { success: true, data: safeResult(newPayment) };
        } catch (error) {
            console.error("Error creating payment:", error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("update-payment", async (event, id: string, data: Partial<PaymentFormValues>) => {
        try {
            let updateData: any = {
                ...data,
                updatedAt: new Date(),
            };

            // Handle date field
            if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);

            const updatedPayment = await prisma.payment.update({
                where: { id },
                data: updateData,
                include: {
                    invoice: {
                        include: {
                            salesOrder: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                },
            });
            return { success: true, data: safeResult(updatedPayment) };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle("delete-payment", async (event, id: string) => {
        try {
            await prisma.payment.delete({ where: { id } });
            return { success: true, message: "Payment deleted successfully." };
        } catch (error) {
      return formatPrismaDeleteError('payment', String(error));
        }
    });
}
