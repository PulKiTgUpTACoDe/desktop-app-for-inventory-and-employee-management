import { ipcMain, app } from 'electron';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { subMonths } from 'date-fns';
import { ReportPeriod, ReportResult } from '../../src/types/report.js';
import prisma from '../../src/lib/prisma.js';

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function reportHandlers() {

  const reportPeriods: ReportPeriod[] = [
    { label: 'Last 1 Month', months: 1 },
    { label: 'Last 3 Months', months: 3 },
    { label: 'Last 6 Months', months: 6 },
    { label: 'Last 1 Year', months: 12 }
  ];

  console.log('Registering report handlers...');

  ipcMain.handle('get-report-periods', async () => {
    return reportPeriods;
  });

  ipcMain.handle('generate-report', async (_, { months }): Promise<ReportResult> => {
    try {
      console.log('Generating report for months:', months);

      const endDate = new Date();
      const startDate = subMonths(endDate, months);

      const reportsDir = path.join(app.getPath('downloads'));
      fs.mkdirSync(reportsDir, { recursive: true });

      console.log(`Saving report to: ${reportsDir}`);

      const toNumber = (v: any) => {
        if (!v) return 0;
        try {
          return Number(v.toString());
        } catch {
          return Number(v);
        }
      };

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
        prisma.product.findMany({ include: { category: true, brand: true, stock: true } }),
        prisma.productCategory.findMany(),
        prisma.productBrand.findMany(),
        prisma.supplier.findMany(),
        prisma.vendor.findMany(),
        prisma.employee.findMany(),
        prisma.purchaseOrder.findMany({
          where: { orderDate: { gte: startDate, lte: endDate } },
          include: { items: { include: { product: true } }, supplier: true },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.salesOrder.findMany({
          where: { orderDate: { gte: startDate, lte: endDate } },
          include: { items: { include: { product: true } }, vendor: true },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.invoice.findMany({
          where: { invoiceDate: { gte: startDate, lte: endDate } },
          include: { salesOrder: true },
          orderBy: { invoiceDate: 'desc' },
        }),
        prisma.payment.findMany({
          where: { paymentDate: { gte: startDate, lte: endDate } },
          include: { invoice: true },
          orderBy: { paymentDate: 'desc' },
        }),
        prisma.payroll.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.stock.findMany({ include: { product: true } }),
      ]);

      const wb = XLSX.utils.book_new();

      const ensureNotEmpty = <T>(d: T[], empty: T) => d.length > 0 ? d : [empty];

      const productsData = ensureNotEmpty(products.map(product => ({
        ID: product.id,
        Name: product.name,
        SKU: product.sku,
        Description: product.description || '',
        Category: product.category?.name || 'N/A',
        Brand: product.brand?.name || 'N/A',
        'Cost Price': toNumber(product.costPrice),
        'Selling Price': toNumber(product.price),
        'Current Stock': (product.stock || []).reduce((s, st) => s + st.quantity, 0),
        'Is Active': product.isActive ? 'Yes' : 'No',
        'Created At': formatDate(product.createdAt),
        'Updated At': formatDate(product.updatedAt),
      })), {
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
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productsData), 'Products');

      const categoriesData = ensureNotEmpty(categories.map(category => ({
        ID: category.id,
        Name: category.name,
        Description: category.description || '',
        'Created At': formatDate(category.createdAt),
        'Updated At': formatDate(category.updatedAt),
      })), {
        ID: 'No Data',
        Name: 'No categories found',
        Description: '',
        'Created At': '',
        'Updated At': '',
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoriesData), 'Categories');

      const brandsData = ensureNotEmpty(brands.map(brand => ({
        ID: brand.id,
        Name: brand.name,
        Description: brand.description || '',
        'Is Active': brand.isActive ? 'Yes' : 'No',
        'Created At': formatDate(brand.createdAt),
        'Updated At': formatDate(brand.updatedAt),
      })), {
        ID: 'No Data',
        Name: 'No brands found',
        Description: '',
        'Is Active': '',
        'Created At': '',
        'Updated At': '',
      });
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
        employees.map((employee: any) => ({
          ID: employee.id,
          Name: employee.firstName + ' ' + employee.lastName,
          Email: employee.email || '',
          Phone: employee.phone || '',
          Address: employee.address || '',
          Position: employee.position || '',
          Department: employee.department || '',
          HireDate: formatDate(employee.hireDate),
          Salary: employee.salary || 0,
          'Is Active': employee.isActive ? 'Yes' : 'No',
          'Created At': formatDate(employee.createdAt),
          'Updated At': formatDate(employee.updatedAt),
        })),
        {
          ID: 'No Data',
          Name: 'No employees found',
          Email: '',
          Phone: '',
          Address: '',
          Position: '',
          Department: '',
          HireDate: '',
          Salary: 0,
          'Is Active': '',
          'Created At': '',
          'Updated At': '',
        }
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(employeesData), 'Employees');

      const purchaseRows = [];
      for (const po of purchaseOrders) {
        const items = po.items || [];
        if (!items.length) {
          continue;
        }

        for (const item of items) {
          const unitPrice = toNumber(item.unitPrice);
          const lineTotal = toNumber(item.totalPrice) || (toNumber(item.quantity) * unitPrice);
          purchaseRows.push({
            'PO ID': po.id,
            'Order Number': po.orderNumber,
            'Supplier': po.supplier?.name || 'N/A',
            'Order Date': formatDate(po.orderDate),
            'Status': po.status,
            'Item': item.product?.name || item.productId || 'N/A',
            'Quantity': item.quantity || 0,
            'Unit Price': unitPrice,
            'Line Total': lineTotal,
            'PO Total': toNumber(po.totalAmount),
            'Notes': po.notes || '',
          });
        }
      }
      const purchaseOrderData = ensureNotEmpty(purchaseRows, {
        'PO ID': 'No Data',
        'Order Number': 'No purchase orders found',
        'Supplier': '',
        'Order Date': '',
        'Status': '',
        'Item': '',
        'Quantity': 0,
        'Unit Price': 0,
        'Line Total': 0,
        'PO Total': 0,
        'Notes': '',
      });

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purchaseOrderData), 'Purchase Orders');

      const salesRows = [];
      for (const so of salesOrders) {
        const items = so.items || [];
        if (!items.length) {
          continue;
        }
        for (const item of items) {
          const unitPrice = toNumber(item.unitPrice);
          const lineTotal = toNumber(item.totalPrice) || (toNumber(item.quantity) * unitPrice);
          salesRows.push({
            'SO ID': so.id,
            'Order Number': so.orderNumber,
            'Vendor': so.vendor?.name || 'N/A',
            'Order Date': formatDate(so.orderDate),
            'Status': so.status,
            'Item': item.product?.name || item.productId || 'N/A',
            'Quantity': item.quantity || 0,
            'Unit Price': unitPrice,
            'Line Total': lineTotal,
            'SO Total': toNumber(so.totalAmount),
            'Notes': so.notes || '',
          });
        }
      }
      const salesOrderData = ensureNotEmpty(salesRows, {
        'SO ID': 'No Data',
        'Order Number': 'No sales orders found',
        'Vendor': '',
        'Order Date': '',
        'Status': '',
        'Item': '',
        'Quantity': 0,
        'Unit Price': 0,
        'Line Total': 0,
        'SO Total': 0,
        'Notes': '',
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesOrderData), 'Sales Orders');

      const invoiceData = ensureNotEmpty(
        invoices.map((invoice: any) => ({
          'Invoice ID': invoice.id,
          'Invoice Number': invoice.invoiceNumber,
          'Invoice Date': formatDate(invoice.invoiceDate),
          'Due Date': formatDate(invoice.dueDate),
          'Total Amount': toNumber(invoice.totalAmount),
          'Payment Status': invoice.paymentStatus,
          'Payment Date': formatDate(invoice.paymentDate),
          'Payment Method': invoice.paymentMethod,
          'Payment Notes': invoice.paymentNotes || '',
        })),
        {
          'Invoice ID': 'No Data',
          'Invoice Number': 'No invoices found',
          'Invoice Date': '',
          'Due Date': '',
          'Total Amount': 0,
          'Payment Status': '',
          'Payment Date': '',
          'Payment Method': '',
          'Payment Notes': '',
        }
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceData), 'Invoices');

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
      )
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
      
      const fileName = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(reportsDir, fileName);
      XLSX.writeFile(wb, filePath);

      return {
        success: true,
        data: { filePath },
        message: 'Report generated successfully'
      };

    } catch (error: any) {
      console.error('Report generation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate report'
      };
    }
  });

  console.log('✅ Report handlers registered successfully');
}
