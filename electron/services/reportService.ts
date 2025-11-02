import * as XLSX from 'xlsx';
import { app } from 'electron';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { subMonths } from 'date-fns';
import { ReportPeriod } from '../../src/types/report.js';
import fs from 'fs';

const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export class ReportService {
    private prisma: PrismaClient;

    public readonly reportPeriods: ReportPeriod[] = [
        { label: 'Last 1 Month', months: 1 },
        { label: 'Last 3 Months', months: 3 },
        { label: 'Last 6 Months', months: 6 },
        { label: 'Last 1 Year', months: 12 },
    ];

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async generateReport(months: number) {
        try {
            // Date range
            const endDate = new Date();
            const startDate = subMonths(endDate, months);

            // Ensure the reports directory exists
            const reportsDir = path.join(app.getPath('documents'), 'Inventory Reports');
            fs.mkdirSync(reportsDir, { recursive: true });

            // Convert Decimal fields safely to numbers
            const toNumber = (v: any) => {
                if (v === null || v === undefined) return 0;
                try {
                    return Number((v as any).toString ? (v as any).toString() : v);
                } catch {
                    return Number(v);
                }
            };

            // Fetch ALL data from database
            const [
                products,
                categories,
                brands,
                suppliers,
                vendors,
                employees,
                purchaseOrders,
                salesOrders,
                invoices,
                payments,
                payrolls,
                stock,
            ] = await Promise.all([
                this.prisma.product.findMany({
                    include: {
                        category: true,
                        brand: true,
                        stock: true,
                    },
                }),
                this.prisma.productCategory.findMany(),
                this.prisma.productBrand.findMany(),
                this.prisma.supplier.findMany(),
                this.prisma.vendor.findMany(),
                this.prisma.employee.findMany(),
                this.prisma.purchaseOrder.findMany({
                    where: {
                        orderDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        supplier: true,
                    },
                    orderBy: {
                        orderDate: 'desc',
                    },
                }),
                this.prisma.salesOrder.findMany({
                    where: {
                        orderDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        vendor: true,
                    },
                    orderBy: {
                        orderDate: 'desc',
                    },
                }),
                this.prisma.invoice.findMany({
                    where: {
                        invoiceDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    include: {
                        salesOrder: true,
                    },
                    orderBy: {
                        invoiceDate: 'desc',
                    },
                }),
                this.prisma.payment.findMany({
                    where: {
                        paymentDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    include: {
                        invoice: true,
                    },
                    orderBy: {
                        paymentDate: 'desc',
                    },
                }),
                this.prisma.payroll.findMany({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    include: {
                        employee: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.stock.findMany({
                    include: {
                        product: true,
                    },
                }),
            ]);

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Helper function to ensure at least one row for empty arrays
            const ensureNotEmpty = <T>(data: T[], emptyRow: T): T[] => {
                return data.length > 0 ? data : [emptyRow];
            };

            // 1. Products Sheet
            const productsData = ensureNotEmpty(
                products.map((product) => {
                    const currentStock = (product.stock || []).reduce((s: number, st: any) => s + (st.quantity || 0), 0);
                    return {
                        ID: product.id,
                        Name: product.name,
                        SKU: product.sku,
                        Description: product.description || '',
                        Category: product.category?.name || 'N/A',
                        Brand: product.brand?.name || 'N/A',
                        'Cost Price': toNumber(product.costPrice),
                        'Selling Price': toNumber(product.price),
                        'Current Stock': currentStock,
                        'Is Active': product.isActive ? 'Yes' : 'No',
                        'Created At': formatDate(product.createdAt),
                        'Updated At': formatDate(product.updatedAt),
                    };
                }),
                {
                    ID: 'No Data',
                    Name: 'No products found',
                    SKU: '',
                    Description: '',
                    Category: '',
                    Brand: '',
                    'Cost Price': 0,
                    'Selling Price': 0,
                    'Current Stock': 0,
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productsData), 'Products');

            // 2. Categories Sheet
            const categoriesData = ensureNotEmpty(
                categories.map((cat: any) => ({
                    ID: cat.id,
                    Name: cat.name,
                    Description: cat.description || '',
                    'Is Active': cat.isActive ? 'Yes' : 'No',
                    'Created At': formatDate(cat.createdAt),
                    'Updated At': formatDate(cat.updatedAt),
                })),
                {
                    ID: 'No Data',
                    Name: 'No categories found',
                    Description: '',
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoriesData), 'Categories');

            // 3. Brands Sheet
            const brandsData = ensureNotEmpty(
                brands.map((brand: any) => ({
                    ID: brand.id,
                    Name: brand.name,
                    Description: brand.description || '',
                    'Is Active': brand.isActive ? 'Yes' : 'No',
                    'Created At': formatDate(brand.createdAt),
                    'Updated At': formatDate(brand.updatedAt),
                })),
                {
                    ID: 'No Data',
                    Name: 'No brands found',
                    Description: '',
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(brandsData), 'Brands');

            // 4. Suppliers Sheet
            const suppliersData = ensureNotEmpty(
                suppliers.map((supplier: any) => ({
                    ID: supplier.id,
                    Name: supplier.name,
                    Email: supplier.email || '',
                    Phone: supplier.phone || '',
                    Address: supplier.address || '',
                    'Contact Person': supplier.contactPerson || '',
                    'Is Active': supplier.isActive ? 'Yes' : 'No',
                    'Created At': formatDate(supplier.createdAt),
                    'Updated At': formatDate(supplier.updatedAt),
                })),
                {
                    ID: 'No Data',
                    Name: 'No suppliers found',
                    Email: '',
                    Phone: '',
                    Address: '',
                    'Contact Person': '',
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(suppliersData), 'Suppliers');

            // 5. Vendors Sheet
            const vendorsData = ensureNotEmpty(
                vendors.map((vendor: any) => ({
                    ID: vendor.id,
                    Name: vendor.name,
                    Email: vendor.email || '',
                    Phone: vendor.phone || '',
                    Address: vendor.address || '',
                    'Contact Person': vendor.contactPerson || '',
                    'Is Active': vendor.isActive ? 'Yes' : 'No',
                    'Created At': formatDate(vendor.createdAt),
                    'Updated At': formatDate(vendor.updatedAt),
                })),
                {
                    ID: 'No Data',
                    Name: 'No vendors found',
                    Email: '',
                    Phone: '',
                    Address: '',
                    'Contact Person': '',
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vendorsData), 'Vendors');

            // 6. Employees Sheet
            const employeesData = ensureNotEmpty(
                employees.map((emp: any) => ({
                    ID: emp.id,
                    'Employee ID': emp.employeeId,
                    'First Name': emp.firstName,
                    'Last Name': emp.lastName,
                    Email: emp.email,
                    Phone: emp.phone || '',
                    Address: emp.address || '',
                    Position: emp.position,
                    Department: emp.department,
                    'Hire Date': formatDate(emp.hireDate),
                    Salary: toNumber(emp.salary),
                    'Is Active': emp.isActive ? 'Yes' : 'No',
                    'Created At': formatDate(emp.createdAt),
                    'Updated At': formatDate(emp.updatedAt),
                })),
                {
                    ID: 'No Data',
                    'Employee ID': '',
                    'First Name': 'No employees found',
                    'Last Name': '',
                    Email: '',
                    Phone: '',
                    Address: '',
                    Position: '',
                    Department: '',
                    'Hire Date': '',
                    Salary: 0,
                    'Is Active': '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(employeesData), 'Employees');

            // 7. Purchase Orders Sheet
            const purchaseOrdersData = purchaseOrders.length > 0 ? purchaseOrders.flatMap((po) => {
                // Handle case where order has no items
                if (!po.items || po.items.length === 0) {
                    return [{
                        'PO ID': po.id,
                        'Order Number': po.orderNumber,
                        'Order Date': formatDate(po.orderDate),
                        'Expected Delivery': formatDate(po.expectedDelivery),
                        Supplier: po.supplier?.name || 'N/A',
                        Product: 'No Items',
                        Quantity: 0,
                        'Unit Price': 0,
                        'Total Price': toNumber(po.totalAmount),
                        Status: po.status,
                        Notes: po.notes || '',
                    }];
                }
                return po.items.map((item: any) => {
                    const unitPrice = toNumber(item.unitPrice);
                    const total = toNumber(item.totalPrice) || (item.quantity ? item.quantity * unitPrice : 0);
                    return {
                        'PO ID': po.id,
                        'Order Number': po.orderNumber,
                        'Order Date': formatDate(po.orderDate),
                        'Expected Delivery': formatDate(po.expectedDelivery),
                        Supplier: po.supplier?.name || 'N/A',
                        Product: item.product?.name || 'Unknown',
                        Quantity: item.quantity || 0,
                        'Unit Price': unitPrice,
                        'Total Price': total,
                        Status: po.status,
                        Notes: po.notes || '',
                    };
                });
            }) : [{
                'PO ID': 'No Data',
                'Order Number': 'No purchase orders found',
                'Order Date': '',
                'Expected Delivery': '',
                Supplier: '',
                Product: '',
                Quantity: 0,
                'Unit Price': 0,
                'Total Price': 0,
                Status: '',
                Notes: '',
            }];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purchaseOrdersData), 'Purchase Orders');

            // 8. Sales Orders Sheet
            const salesOrdersData = salesOrders.length > 0 ? salesOrders.flatMap((order) => {
                // Handle case where order has no items
                if (!order.items || order.items.length === 0) {
                    return [{
                        'Sales Order ID': order.id,
                        'Order Number': order.orderNumber,
                        'Order Date': formatDate(order.orderDate),
                        'Expected Delivery': formatDate(order.expectedDelivery),
                        Vendor: order.vendor?.name || 'N/A',
                        Product: 'No Items',
                        Quantity: 0,
                        'Unit Price': 0,
                        'Total Price': toNumber(order.totalAmount),
                        Status: order.status,
                        Notes: order.notes || '',
                    }];
                }
                return order.items.map((item: any) => {
                    const unitPrice = toNumber(item.unitPrice);
                    const total = toNumber(item.totalPrice) || (item.quantity ? item.quantity * unitPrice : 0);
                    return {
                        'Sales Order ID': order.id,
                        'Order Number': order.orderNumber,
                        'Order Date': formatDate(order.orderDate),
                        'Expected Delivery': formatDate(order.expectedDelivery),
                        Vendor: order.vendor?.name || 'N/A',
                        Product: item.product?.name || 'Unknown',
                        Quantity: item.quantity || 0,
                        'Unit Price': unitPrice,
                        'Total Price': total,
                        Status: order.status,
                        Notes: order.notes || '',
                    };
                });
            }) : [{
                'Sales Order ID': 'No Data',
                'Order Number': 'No sales orders found',
                'Order Date': '',
                'Expected Delivery': '',
                Vendor: '',
                Product: '',
                Quantity: 0,
                'Unit Price': 0,
                'Total Price': 0,
                Status: '',
                Notes: '',
            }];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesOrdersData), 'Sales Orders');

            // 9. Invoices Sheet
            const invoicesData = ensureNotEmpty(
                invoices.map((invoice: any) => ({
                    ID: invoice.id,
                    'Invoice Number': invoice.invoiceNumber,
                    'Invoice Date': formatDate(invoice.invoiceDate),
                    'Due Date': formatDate(invoice.dueDate),
                    'Sales Order Number': invoice.salesOrder?.orderNumber || 'N/A',
                    'Total Amount': toNumber(invoice.totalAmount),
                    Status: invoice.status,
                    'Created At': formatDate(invoice.createdAt),
                    'Updated At': formatDate(invoice.updatedAt),
                })),
                {
                    ID: 'No Data',
                    'Invoice Number': 'No invoices found',
                    'Invoice Date': '',
                    'Due Date': '',
                    'Sales Order Number': '',
                    'Total Amount': 0,
                    Status: '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoicesData), 'Invoices');

            // 10. Payments Sheet
            const paymentsData = ensureNotEmpty(
                payments.map((payment: any) => ({
                    ID: payment.id,
                    'Invoice Number': payment.invoice?.invoiceNumber || 'N/A',
                    Amount: toNumber(payment.amount),
                    'Payment Date': formatDate(payment.paymentDate),
                    'Payment Method': payment.paymentMethod,
                    Reference: payment.reference || '',
                    Notes: payment.notes || '',
                    'Created At': formatDate(payment.createdAt),
                    'Updated At': formatDate(payment.updatedAt),
                })),
                {
                    ID: 'No Data',
                    'Invoice Number': 'No payments found',
                    Amount: 0,
                    'Payment Date': '',
                    'Payment Method': '',
                    Reference: '',
                    Notes: '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentsData), 'Payments');

            // 11. Payrolls Sheet
            const payrollsData = ensureNotEmpty(
                payrolls.map((payroll: any) => ({
                    ID: payroll.id,
                    'Employee Name': payroll.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : 'N/A',
                    'Employee ID': payroll.employee?.employeeId || 'N/A',
                    Month: payroll.month,
                    Year: payroll.year,
                    'Basic Salary': toNumber(payroll.basicSalary),
                    Allowances: toNumber(payroll.allowances),
                    Deductions: toNumber(payroll.deductions),
                    'Net Salary': toNumber(payroll.netSalary),
                    Status: payroll.status,
                    'Created At': formatDate(payroll.createdAt),
                    'Updated At': formatDate(payroll.updatedAt),
                })),
                {
                    ID: 'No Data',
                    'Employee Name': 'No payrolls found',
                    'Employee ID': '',
                    Month: 0,
                    Year: 0,
                    'Basic Salary': 0,
                    Allowances: 0,
                    Deductions: 0,
                    'Net Salary': 0,
                    Status: '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payrollsData), 'Payrolls');

            // 12. Stock Sheet
            const stockData = ensureNotEmpty(
                stock.map((s: any) => ({
                    ID: s.id,
                    'Product Name': s.product?.name || 'N/A',
                    'Product SKU': s.product?.sku || 'N/A',
                    Quantity: s.quantity,
                    Location: s.location || '',
                    'Created At': formatDate(s.createdAt),
                    'Updated At': formatDate(s.updatedAt),
                })),
                {
                    ID: 'No Data',
                    'Product Name': 'No stock records found',
                    'Product SKU': '',
                    Quantity: 0,
                    Location: '',
                    'Created At': '',
                    'Updated At': '',
                }
            );
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockData), 'Stock');

            // 13. Summary Sheet
            const summaryData: any[] = [
                ['Report Period', `${formatDate(startDate)} to ${formatDate(endDate)}`],
                ['Generated On', formatDate(new Date())],
                [],
                ['Summary', ''],
                ['Total Products', products.length],
                ['Total Categories', categories.length],
                ['Total Brands', brands.length],
                ['Total Suppliers', suppliers.length],
                ['Total Vendors', vendors.length],
                ['Total Employees', employees.length],
                ['Purchase Orders (Period)', purchaseOrders.length],
                ['Sales Orders (Period)', salesOrders.length],
                ['Invoices (Period)', invoices.length],
                ['Payments (Period)', payments.length],
                ['Payrolls (Period)', payrolls.length],
                ['Stock Records', stock.length],
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

            // Save the file
            const fileName = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            const filePath = path.join(reportsDir, fileName);
            XLSX.writeFile(wb, filePath);

            return { filePath };

        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }
}

